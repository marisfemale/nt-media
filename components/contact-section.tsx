"use client"

import React from "react"

import { useState } from "react"
import { AlertCircle, CheckCircle2, Mail, Phone, Send } from "lucide-react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    let response: Response

    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          project_type: formData.projectType,
          message: formData.message,
        }),
      })
    } catch {
      setIsSubmitting(false)
      setErrorMessage("We could not send your inquiry. Please try again or email us directly.")
      return
    }

    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMessage("We could not send your inquiry. Please try again or email us directly.")
      return
    }

    setIsSubmitted(true)
    setFormData({
      name: "",
      email: "",
      phone: "",
      projectType: "",
      message: "",
    })
  }

  return (
    <section id="contact" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
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
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Follow Us On
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=100069264489984"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div className="bg-secondary p-8 md:p-12 border border-border">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-6">
              Start Your Project
            </h3>
            {isSubmitted && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 border border-accent/40 bg-accent/10 p-4 text-sm text-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <p>
                  Your inquiry has been sent. We will get back to you within one business day.
                </p>
              </div>
            )}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <p>{errorMessage}</p>
              </div>
            )}
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
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-background border-border rounded-none focus:border-accent"
                    placeholder="Your name"
                    disabled={isSubmitting}
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
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-background border-border rounded-none focus:border-accent"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
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
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-background border-border rounded-none focus:border-accent"
                    placeholder="+61 493 316 602"
                    disabled={isSubmitting}
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
                    className="w-full h-10 px-3 bg-background border border-border text-foreground focus:border-accent focus:outline-none disabled:opacity-50"
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="photography">Photography</option>
                    <option value="scripted">Scripted Video</option>
                    <option value="unscripted">Unscripted Video</option>
                    <option value="full-production">Full Production</option>
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
                  disabled={isSubmitting}
                  minLength={10}
                  maxLength={2000}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground rounded-none py-6 text-sm uppercase tracking-widest"
              >
                <Send size={16} className="mr-2" />
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
