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
}

interface SavedEventsContextType {
  savedEvents: Event[];
  saveEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
}

const SavedEventsContext = createContext<SavedEventsContextType | undefined>(
  undefined
);

export const SavedEventsProvider = ({ children }: { children: ReactNode }) => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);

  const saveEvent = (event: Event) => {
    setSavedEvents((prev) => {
      if (prev.some((e) => e.id === event.id)) return prev; // avoid duplicates
      return [...prev, event];
    });
  };

  const removeEvent = (eventId: string) => {
    setSavedEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  return (
    <SavedEventsContext.Provider
      value={{ savedEvents, saveEvent, removeEvent }}
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
