import React, { useEffect, useState } from "react";
import { getMyGrades } from "@/services/studentService.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card/Card";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table/Table";
import { Loader2 } from "lucide-react";

const GradeOverview = ({ studentId }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await getMyGrades(studentId);
        setGrades(data);
      } catch (err) {
        console.error("Error fetching grades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Bảng điểm</CardTitle>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <p className="text-gray-500">Chưa có điểm nào.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Môn học</TableCell>
                <TableCell>Điểm giữa kỳ</TableCell>
                <TableCell>Điểm cuối kỳ</TableCell>
                <TableCell>Điểm trung bình</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.courseId}>
                  <TableCell>{grade.courseName}</TableCell>
                  <TableCell>{grade.midterm || "-"}</TableCell>
                  <TableCell>{grade.final || "-"}</TableCell>
                  <TableCell>{grade.average || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default GradeOverview;
