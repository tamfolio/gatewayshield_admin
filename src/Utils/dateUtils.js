// src/utils/dateUtils.js

export function extractDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
  
  export function extractTime(isoString) {
    const date = new Date(isoString);
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  export const getAvatarInitial = (name) => name?.charAt(0).toUpperCase() || "";

  export const avatarColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  export const getAvatarColor = (name) => {
    if (!name || typeof name !== "string") return "bg-gray-500";
    const index =
      [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      avatarColors.length;
    return avatarColors[index];
  };

 export const statusColorMap = {
    new: "bg-green-500",
    in_progress: "bg-orange-500",
    rejected: "bg-red-500",
    on_hold: "bg-yellow-500",
    resolved: "bg-blue-500",
  };

  