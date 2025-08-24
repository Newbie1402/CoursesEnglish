import React from "react";

const CourseCard = ({ course, onView }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition cursor-pointer">
      <img
        src={course.image || "/default-course.png"}
        alt={course.name}
        className="w-full h-40 object-cover rounded-xl mb-3"
      />
      <h3 className="text-lg font-semibold">{course.name}</h3>
      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
      <button
        onClick={() => onView(course.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Xem chi tiết
      </button>
    </div>
  );
};

export default CourseCard;
