import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">Contact Me</h2>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a
            href="mailto:draudalesmontes@gmail.com"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="size-5" />
            Email
          </a>

          {/* TODO: replace with your real LinkedIn URL */}
          <a
            href="https://www.linkedin.com/in/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-5" />
            LinkedIn
          </a>

          {/* TODO: replace with your real GitHub URL */}
          <a
            href="https://github.com/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-5" />
            GitHub
          </a>

          <Link
            href="/contact"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact page →
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Diego Raudales. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
