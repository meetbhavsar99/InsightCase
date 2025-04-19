"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] =
    useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<any[]>([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/case/events",
          {
            withCredentials: true,
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const fetchedEvents = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: event.startDate,
          end: event.endDate,
          location: event.location,
          organizer: event.organizer,
        }));
        setCurrentEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleDateClick = (selected: any) => {
    const selectedDateStr = selected.startStr;
    setSelectedDate(selectedDateStr);

    // Filter events for the clicked date
    const filteredEvents = currentEvents.filter((event) => {
      const eventDate = new Date(event.start).toISOString().split("T")[0];
      return eventDate === selectedDateStr;
    });

    setEventsForSelectedDate(filteredEvents);
    setIsDetailsDialogOpen(true);
  };

  const handleEventClick = (selected: any) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      selected.event.remove();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && selectedDate) {
      const calendarApi = selectedDate.view.calendar;
      calendarApi.unselect();

      const newEvent = {
        id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
        title: newEventTitle,
        start: selectedDate.start,
        end: selectedDate.end,
        allDay: selectedDate.allDay,
      };

      calendarApi.addEvent(newEvent);
      handleCloseDialog();
    }
  };

  return (
    <div className="p-6 mt-10 mb-5 max-w-5xl mx-auto bg-gray-900 text-gray-100 shadow-md rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-4 rounded-md shadow-sm">
          <h2 className="text-2xl font-semibold text-amber-300 mb-4 text-white">
            Calendar Events
          </h2>
          <ul className="space-y-2">
            {currentEvents.length === 0 && (
              <li className="text-gray-400 italic text-center">
                No Events Present
              </li>
            )}
            {currentEvents.map((event) => (
              <li
                key={event.id}
                className="border border-gray-700 rounded-lg p-3 text-sm text-blue-400"
              >
                {event.title}
                <div className="text-gray-400">
                  {new Date(event.start).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2">
          <FullCalendar
            height={"70vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents}
            contentHeight="auto"
          />
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-700 p-2 rounded-md bg-gray-700 text-white"
            />
            <button
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
              type="submit"
            >
              Add Event
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Events on {selectedDate}</DialogTitle>
          </DialogHeader>
          {eventsForSelectedDate.length > 0 ? (
            <ul className="space-y-4">
              {eventsForSelectedDate.map((event) => (
                <li
                  key={event.id}
                  className="border border-gray-700 rounded-lg p-4"
                >
                  <h3 className="font-bold text-blue-400">{event.title}</h3>
                  <p className="text-sm text-gray-300">
                    Organizer: {event.organizer}
                  </p>
                  <p className="text-sm text-gray-300">
                    Location: {event.location}
                  </p>
                  <p className="text-sm text-gray-300">
                    Start: {new Date(event.start).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-300">
                    End: {new Date(event.end).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-400">No events on this date.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
