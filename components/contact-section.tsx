"use client"

import React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <section id="contact" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Info */}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              Get in Touch
            </p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
              Let&apos;s Create Something Extraordinary
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Ready to bring your vision to life? We would love to hear about
              your project. Reach out and let&apos;s start a conversation.
            </p>

            {/* Contact Info */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary border border-border">
                  <Mail size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:hello@ntmedia.com.au"
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    hello@ntmedia.com.au
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary border border-border">
                  <Phone size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Phone
                  </p>
                  <a
                    href="tel:+61493316602"
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    +61 493 316 602
                  </a>
                </div>
              </div>

              {/* <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary border border-border">
                  <MapPin size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Studio
                  </p>
                  <p className="text-foreground">Palmerston, Northern Territory</p>
                </div>
              </div> */}
            </div>

            {/* Social Links */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Follow Us On
              </p>
              <div className="flex gap-4">
                {[
                  // { name: "Instagram", href: "https://www.instagram.com/cinemaris_/" },
                  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=100069264489984" },
                  // { name: "LinkedIn", href: "https://www.linkedin.com/in/your-profile" },
                  // { name: "YouTube", href: "https://youtube.com/@your-channel" }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"             // Mở link trong tab mới
                    rel="noopener noreferrer"    // Bảo mật khi mở link ngoài
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-secondary p-8 md:p-12 border border-border">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-6">
              Start Your Project
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-background border-border rounded-none focus:border-accent"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-background border-border rounded-none focus:border-accent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                  >
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-background border-border rounded-none focus:border-accent"
                    placeholder="+1 (234) 567-890"
                  />
                </div>
                <div>
                  <label
                    htmlFor="projectType"
                    className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                  >
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={(e) =>
                      setFormData({ ...formData, projectType: e.target.value })
                    }
                    className="w-full h-10 px-3 bg-background border border-border text-foreground focus:border-accent focus:outline-none"
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="photography">Photography</option>
                    <option value="scripted">Scripted Video</option>
                    <option value="unscripted">Unscripted Video</option>
                    <option value="full">Full Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Tell Us About Your Project
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="bg-background border-border rounded-none focus:border-accent min-h-[150px] resize-none"
                  placeholder="Share your vision, timeline, and any specific requirements..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground rounded-none py-6 text-sm uppercase tracking-widest"
              >
                <Send size={16} className="mr-2" />
                Send Inquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
