export interface Booking {
  id: string;
  productName: string;
  productSlug: string;
  date: string;
  price: string;
  createdAt: string;
}

const STORAGE_KEY = "festiva_bookings";

export function getBookings(): Booking[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addBooking(booking: Omit<Booking, "id" | "createdAt">): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
}
