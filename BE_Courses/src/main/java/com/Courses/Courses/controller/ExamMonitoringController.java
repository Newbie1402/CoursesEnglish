package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.MonitoringEventDto;
import com.Courses.Courses.model.dto.MonitoringEventResponseDto;
import com.Courses.Courses.model.request.EventResolveRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.service.ExamMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/exam-monitoring")
public class ExamMonitoringController {

    private final ExamMonitoringService examMonitoringService;

    @Autowired
    public ExamMonitoringController(ExamMonitoringService examMonitoringService) {
        this.examMonitoringService = examMonitoringService;
    }

    /**
     * API nhận sự kiện giám sát từ client
     */
    @PostMapping("/events")
    public ResponseEntity<ResponseData<Void>> recordMonitoringEvent(@RequestBody MonitoringEventDto eventDto) {
        return examMonitoringService.sendMonitoringEvent(eventDto);
    }

    /**
     * API lấy danh sách sự kiện giám sát của một học sinh trong bài kiểm tra
     */
    @GetMapping("/events")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseData<List<MonitoringEventResponseDto>>> getMonitoringEvents(
            @RequestParam Long examId,
            @RequestParam Long studentId) {
        try {
            List<MonitoringEventResponseDto> events = examMonitoringService.getMonitoringEventsDtoByExamAndStudent(examId, studentId);
            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Lấy danh sách sự kiện giám sát thành công",
                    events
                )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ResponseData<>(
                    StatusApplication.BAD_REQUEST.getCode(),
                    "Lỗi khi lấy danh sách sự kiện giám sát: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * API lấy danh sách sự kiện giám sát chưa được giải quyết trong bài kiểm tra
     * Sử dụng DTO để tránh vòng lặp vô hạn trong JSON
     */
    @GetMapping("/events/unresolved")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseData<List<MonitoringEventResponseDto>>> getUnresolvedEvents(@RequestParam Long examId) {
        try {
            List<MonitoringEventResponseDto> events = examMonitoringService.getUnresolvedEventsDto(examId);
            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Lấy danh sách sự kiện giám sát chưa giải quyết thành công",
                    events
                )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ResponseData<>(
                    StatusApplication.BAD_REQUEST.getCode(),
                    "Lỗi khi lấy danh sách sự kiện giám sát: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * API đánh dấu sự kiện giám sát đã được giải quyết
     */
    @PatchMapping("/events/{eventId}/resolve")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseData<Void>> resolveEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody EventResolveRequest request) {
        try {
            examMonitoringService.resolveEvent(eventId, request.getResolvedBy(), request.getResolveNote());
            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Đánh dấu sự kiện đã giải quyết thành công",
                    null
                )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ResponseData<>(
                    StatusApplication.BAD_REQUEST.getCode(),
                    "Lỗi khi đánh dấu sự kiện đã giải quyết: " + e.getMessage(),
                    null
                )
            );
        }
    }
}
