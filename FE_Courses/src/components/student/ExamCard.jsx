import React from "react";

const ExamCard = ({ exam, onStart }) => {
  const statusColors = {
    upcoming: "text-blue-600 bg-blue-100",
    ongoing: "text-green-600 bg-green-100",
    completed: "text-gray-600 bg-gray-200",
  };

  return (
    <div className="border rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-2">
      <h3 className="text-lg font-semibold">{exam.title}</h3>
      <p className="text-gray-500 text-sm">Ngày: {exam.date}</p>
      <span
        className={`px-3 py-1 text-sm rounded-full w-fit ${
          statusColors[exam.status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {exam.status === "upcoming"
          ? "Sắp diễn ra"
          : exam.status === "ongoing"
          ? "Đang diễn ra"
          : "Đã hoàn thành"}
      </span>
      {exam.status === "upcoming" && (
        <button
          onClick={() => onStart(exam.id)}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          Bắt đầu
        </button>
      )}
    </div>
  );
};

export default ExamCard;
