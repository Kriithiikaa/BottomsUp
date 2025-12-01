import React, { createContext, useContext, useState, ReactNode } from "react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  description: string;
  image?: string;
  live?: boolean;
  rsvped?: boolean; // NEW FLAG
}

interface SavedEventsContextType {
  savedEvents: Event[];
  rsvpedEvents: Event[]; // NEW
  saveEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;

  rsvpEvent: (event: Event) => void; // NEW
  unRsvpEvent: (eventId: string) => void; // FUTURE OPTION
}

const SavedEventsContext = createContext<SavedEventsContextType | undefined>(
  undefined
);

export const SavedEventsProvider = ({ children }: { children: ReactNode }) => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [rsvpedEvents, setRsvpedEvents] = useState<Event[]>([]);

  /* --------------------------------------------------------
     SAVE EVENT (same as your original logic)
  -------------------------------------------------------- */
  const saveEvent = (event: Event) => {
    setSavedEvents((prev) => {
      if (prev.some((e) => e.id === event.id)) return prev;
      return [...prev, { ...event, rsvped: false }];
    });
  };

  /* --------------------------------------------------------
     REMOVE EVENT (same as before, but remove from RSVP too)
  -------------------------------------------------------- */
  const removeEvent = (eventId: string) => {
    setSavedEvents((prev) => prev.filter((event) => event.id !== eventId));
    setRsvpedEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  /* --------------------------------------------------------
     RSVP EVENT
     - mark saved event as rsvped
     - add to rsvpedEvents list
  -------------------------------------------------------- */
  const rsvpEvent = (event: Event) => {
    // update saved events
    setSavedEvents((prev) =>
      prev.map((ev) => (ev.id === event.id ? { ...ev, rsvped: true } : ev))
    );

    // add to RSVP list if not already there
    setRsvpedEvents((prev) => {
      if (prev.some((ev) => ev.id === event.id)) return prev;
      return [...prev, { ...event, rsvped: true }];
    });
  };

  /* --------------------------------------------------------
     UN-RSVP EVENT (not used yet but safe to have)
  -------------------------------------------------------- */
  const unRsvpEvent = (eventId: string) => {
    // update saved events
    setSavedEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, rsvped: false } : ev))
    );

    // remove from rsvped list
    setRsvpedEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  return (
    <SavedEventsContext.Provider
      value={{
        savedEvents,
        rsvpedEvents,
        saveEvent,
        removeEvent,
        rsvpEvent,
        unRsvpEvent,
      }}
    >
      {children}
    </SavedEventsContext.Provider>
  );
};

export const useSavedEvents = () => {
  const context = useContext(SavedEventsContext);
  if (!context) {
    throw new Error("useSavedEvents must be used within a SavedEventsProvider");
  }
  return context;
};
