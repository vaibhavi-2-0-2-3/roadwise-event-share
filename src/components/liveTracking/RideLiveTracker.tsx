// components/RideShare/RideLiveTracker.jsx
import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import RideMapView from "./RideMapView";
import RideParticipantList from "./RideParticipantList";

export default function RideLiveTracker({ currentUserId, participants }) {
  const rideId = participants[0]?.rideId;
  const currentUser = participants.find((p) => p.userId === currentUserId);
  const [isSharing, setIsSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [activeLocations, setActiveLocations] = useState({});
  const watchIdRef = useRef(null);

  // Start sharing
  const startSharing = () => {
    if (!currentUser) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: currentUser.name,
          lastUpdated: Date.now(),
        };
        setMyLocation(coords);
        setDoc(doc(db, "rides", rideId, "locations", currentUserId), coords);
      },
      (err) => console.error("Geolocation error", err),
      { enableHighAccuracy: true }
    );
    watchIdRef.current = id;
    setIsSharing(true);
  };

  useEffect(() => {
    console.log("👀 RideLiveTracker mounted");
    console.log("📍 Ride ID:", rideId);
    console.log("🙋 All participants:", participants);
  }, []);

  // Stop sharing
  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    deleteDoc(doc(db, "rides", rideId, "locations", currentUserId));
    setIsSharing(false);
    setMyLocation(null);
  };

  // Listen to ride participants' live locations
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rides", rideId, "locations"),
      (snap) => {
        const updates = {};
        snap.forEach((doc) => {
          updates[doc.id] = doc.data();
        });
        setActiveLocations(updates);
      }
    );
    return () => unsub();
  }, [rideId]);

  const enrichedParticipants = participants.map((p) => ({
    ...p,
    isSharing: !!activeLocations[p.userId],
  }));

  const otherUsers = Object.entries(activeLocations)
    .filter(([uid]) => uid !== currentUserId)
    .map(([_, data]) => data);

  return (
    <div className="flex p-4 gap-4">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-2">Welcome, {currentUser?.name}</h2>
        <button
          onClick={isSharing ? stopSharing : startSharing}
          className="px-4 py-2 bg-blue-500 text-black rounded mb-4"
        >
          {isSharing ? "⛔ Stop Sharing" : "📡 Start Sharing"}
        </button>

        <RideMapView myLocation={myLocation} otherUsers={otherUsers} />
      </div>

      <RideParticipantList participants={enrichedParticipants} />
    </div>
  );
}