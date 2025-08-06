package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.AcceptedAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AcceptedAccountRepository extends JpaRepository<AcceptedAccount, Long> {

    Optional<AcceptedAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    List<AcceptedAccount> findAllByIsAcceptedTrue();

    List<AcceptedAccount> findAllByIsAcceptedFalse();
}
