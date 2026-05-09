"use client";

import { BellIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type NotificationItem = {
  id: string;
  message: string;
  timestamp: string;
};

type NotificationButtonProps = {
  items: NotificationItem[];
};

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function NotificationButton({ items }: NotificationButtonProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(items.length);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleToggle() {
    setIsOpen((current) => !current);
    setUnreadCount(0);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Notifications"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-text-soft)] shadow-sm transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
        onClick={handleToggle}
        type="button"
      >
        <motion.span
          animate={
            unreadCount > 0 && !isOpen
              ? { rotate: [0, -16, 16, -12, 12, 0] }
              : { rotate: 0 }
          }
          transition={{
            duration: 0.9,
            ease: "easeInOut",
            repeat: unreadCount > 0 && !isOpen ? Number.POSITIVE_INFINITY : 0,
            repeatDelay: 1.2,
          }}
        >
          <BellIcon aria-hidden="true" size={20} weight="regular" />
        </motion.span>
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ops-primary)] px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card)] p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--ops-text)]">
              Notifications
            </p>
            <span className="text-xs text-[var(--ops-text-muted)]">Read</span>
          </div>
          {items.length === 0 ? (
            <p className="mt-3 rounded-lg bg-[var(--ops-card-soft)] px-3 py-2 text-sm text-[var(--ops-text-soft)]">
              No new notifications.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li
                  className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] px-3 py-2"
                  key={item.id}
                >
                  <p className="text-sm text-[var(--ops-text)]">{item.message}</p>
                  <p className="mt-1 text-xs text-[var(--ops-text-muted)]">
                    {formatTime(item.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

