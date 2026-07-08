---
name: Staging QA checklist
about: Track a full staging test pass
title: "[STAGING] QA Checklist - YYYY-MM-DD"
labels: staging, qa
assignees: ""
---

Staging URL:

```text
http://148.230.101.181:3011
```

Admin login:

```text
http://148.230.101.181:3011/admin-login
```

Instructions:

- Tick each test after it passes.
- If a test fails, create a new GitHub issue using the `Staging bug` template.
- Paste the bug issue link under the failed test.
- Add device/browser notes where useful.

## Public Site

- [ ] TC-001 Home page loads
  - Expected: Page loads without errors; main content, images, header, and footer are visible.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-002 Navigation works
  - Expected: Each header/footer navigation link goes to the correct section or page without layout issues.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-003 Responsive layout
  - Expected: Text, images, buttons, and forms do not overlap or overflow on mobile, tablet, and desktop.
  - Result:
  - Bug link:
  - Device/browser:

## Contact

- [ ] TC-004 Submit contact form
  - Expected: Form submits successfully and shows a clear success message.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-005 Contact validation
  - Expected: Clear validation messages appear and no broken page occurs.
  - Result:
  - Bug link:
  - Device/browser:

## Booking

- [ ] TC-006 Create booking inquiry
  - Expected: Booking is accepted and confirmation/success message appears.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-007 Booking validation
  - Expected: Clear validation messages appear and invalid booking is not submitted.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-008 Blocked date behavior
  - Expected: Blocked dates cannot be selected or are clearly marked.
  - Result:
  - Bug link:
  - Device/browser:

## Payment

- [ ] TC-009 Stripe test payment
  - Expected: Payment succeeds in test mode only and booking state updates correctly.
  - Test card: `4242 4242 4242 4242`, any future expiry, any CVC.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-010 Stripe failed payment
  - Expected: Payment failure is handled gracefully with a clear message.
  - Result:
  - Bug link:
  - Device/browser:

## Admin

- [ ] TC-011 Admin login works
  - Expected: Tester reaches admin dashboard.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-012 Invalid admin login
  - Expected: Access is denied with a clear error and no dashboard access.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-013 Dashboard loads
  - Expected: Dashboard loads without errors.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-014 View bookings
  - Expected: Test booking appears with correct details.
  - Result:
  - Bug link:
  - Device/browser:

## Admin Galleries

- [ ] TC-015 Create gallery
  - Expected: Gallery is created and appears in admin list.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-016 Upload gallery photos
  - Expected: Images upload successfully and thumbnails/previews render.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-017 Set cover image
  - Expected: Selected cover image is saved and shown correctly.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-018 Edit gallery
  - Expected: Changes save and remain after refresh.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-019 Delete test gallery/photo
  - Expected: Item is removed and page remains stable.
  - Result:
  - Bug link:
  - Device/browser:

## Client Gallery

- [ ] TC-020 Gallery browse page
  - Expected: Page loads without errors and appropriate content is shown.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-021 Access gallery by code
  - Expected: Gallery loads only when the correct code/access path is used.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-022 Download gallery
  - Expected: Download starts successfully and downloaded file opens.
  - Result:
  - Bug link:
  - Device/browser:

## Settings And Notifications

- [ ] TC-023 Update settings
  - Expected: Setting persists after refresh and does not affect production.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-024 Email delivery
  - Expected: Email is received by the staging/test recipient only.
  - Result:
  - Bug link:
  - Device/browser:

## Security And Reliability

- [ ] TC-025 Logged-out admin protection
  - Expected: User is redirected to login or denied access.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-026 Basic speed check
  - Expected: Pages feel responsive and no page hangs for more than a few seconds.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-027 Refresh and back button behavior
  - Expected: No blank screen or unexpected crash occurs.
  - Result:
  - Bug link:
  - Device/browser:

- [ ] TC-028 Browser compatibility
  - Expected: Core flows work in each tested browser.
  - Result:
  - Bug link:
  - Device/browser:
