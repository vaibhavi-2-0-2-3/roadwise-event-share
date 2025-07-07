// components/RideShare/RideParticipantList.jsx
import React from "react";

export default function RideParticipantList({ participants }) {
  return (
    <div className="p-4 border-l w-1/4 bg-white overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Ride Participants</h2>
      <ul className="space-y-1">
        {participants.map((p) => (
          <li key={p.userId} className="text-sm">
            {p.isSharing ? "🟢" : "🔴"} {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}