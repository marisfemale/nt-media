export interface ZipEntry {
  name: string
  data: Buffer
  modifiedAt?: Date
}

interface PreparedZipEntry extends ZipEntry {
  crc: number
  dosDate: number
  dosTime: number
  nameBuffer: Buffer
  offset: number
}

const crcTable = (() => {
  const table = new Uint32Array(256)

  for (let i = 0; i < 256; i++) {
    let crc = i

    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }

    table[i] = crc >>> 0
  }

  return table
})()

function crc32(data: Buffer) {
  let crc = 0xffffffff

  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

function clampDosDate(date: Date) {
  const year = Math.min(Math.max(date.getFullYear(), 1980), 2107)
  return new Date(year, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())
}

function getDosTime(date: Date) {
  return (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
}

function getDosDate(date: Date) {
  return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
}

function assertZip32Size(value: number, label: string) {
  if (value > 0xffffffff) {
    throw new Error(`${label} is too large for this ZIP writer`)
  }
}

function createLocalHeader(entry: PreparedZipEntry) {
  const header = Buffer.alloc(30 + entry.nameBuffer.length)

  header.writeUInt32LE(0x04034b50, 0)
  header.writeUInt16LE(20, 4)
  header.writeUInt16LE(0x0800, 6)
  header.writeUInt16LE(0, 8)
  header.writeUInt16LE(entry.dosTime, 10)
  header.writeUInt16LE(entry.dosDate, 12)
  header.writeUInt32LE(entry.crc, 14)
  header.writeUInt32LE(entry.data.length, 18)
  header.writeUInt32LE(entry.data.length, 22)
  header.writeUInt16LE(entry.nameBuffer.length, 26)
  header.writeUInt16LE(0, 28)
  entry.nameBuffer.copy(header, 30)

  return header
}

function createCentralHeader(entry: PreparedZipEntry) {
  const header = Buffer.alloc(46 + entry.nameBuffer.length)

  header.writeUInt32LE(0x02014b50, 0)
  header.writeUInt16LE(20, 4)
  header.writeUInt16LE(20, 6)
  header.writeUInt16LE(0x0800, 8)
  header.writeUInt16LE(0, 10)
  header.writeUInt16LE(entry.dosTime, 12)
  header.writeUInt16LE(entry.dosDate, 14)
  header.writeUInt32LE(entry.crc, 16)
  header.writeUInt32LE(entry.data.length, 20)
  header.writeUInt32LE(entry.data.length, 24)
  header.writeUInt16LE(entry.nameBuffer.length, 28)
  header.writeUInt16LE(0, 30)
  header.writeUInt16LE(0, 32)
  header.writeUInt16LE(0, 34)
  header.writeUInt16LE(0, 36)
  header.writeUInt32LE(0, 38)
  header.writeUInt32LE(entry.offset, 42)
  entry.nameBuffer.copy(header, 46)

  return header
}

function createEndOfCentralDirectory(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number) {
  const record = Buffer.alloc(22)

  record.writeUInt32LE(0x06054b50, 0)
  record.writeUInt16LE(0, 4)
  record.writeUInt16LE(0, 6)
  record.writeUInt16LE(entryCount, 8)
  record.writeUInt16LE(entryCount, 10)
  record.writeUInt32LE(centralDirectorySize, 12)
  record.writeUInt32LE(centralDirectoryOffset, 16)
  record.writeUInt16LE(0, 20)

  return record
}

export function createZip(entries: ZipEntry[]) {
  if (entries.length > 0xffff) {
    throw new Error("Too many files for this ZIP writer")
  }

  let offset = 0
  const preparedEntries = entries.map((entry) => {
    const modifiedAt = clampDosDate(entry.modifiedAt ?? new Date())
    const nameBuffer = Buffer.from(entry.name, "utf8")

    if (nameBuffer.length > 0xffff) {
      throw new Error(`${entry.name} is too long for this ZIP writer`)
    }

    assertZip32Size(entry.data.length, entry.name)

    const preparedEntry: PreparedZipEntry = {
      ...entry,
      crc: crc32(entry.data),
      dosDate: getDosDate(modifiedAt),
      dosTime: getDosTime(modifiedAt),
      nameBuffer,
      offset,
    }

    offset += 30 + nameBuffer.length + entry.data.length
    assertZip32Size(offset, "ZIP file")

    return preparedEntry
  })

  const localRecords = preparedEntries.flatMap((entry) => [createLocalHeader(entry), entry.data])
  const centralRecords = preparedEntries.map(createCentralHeader)
  const centralDirectoryOffset = offset
  const centralDirectorySize = centralRecords.reduce((size, record) => size + record.length, 0)

  assertZip32Size(centralDirectorySize, "ZIP central directory")
  assertZip32Size(centralDirectoryOffset + centralDirectorySize, "ZIP file")

  return Buffer.concat([
    ...localRecords,
    ...centralRecords,
    createEndOfCentralDirectory(entries.length, centralDirectorySize, centralDirectoryOffset),
  ])
}
