package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.sentViaWebsocket = false AND n.retryCount < 3")
    List<Notification> findPendingNotificationsForUser(Long userId);

    List<Notification> findBySentViaWebsocketFalseAndRetryCountLessThan(int maxRetries);
}
