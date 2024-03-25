package com.rakesh.codingbattle.repository;

import com.rakesh.codingbattle.entity.ContestUsers;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContestUsersRepository extends JpaRepository<ContestUsers, Long> {
    List<ContestUsers> findByContestId(Long contestId);

    Optional<ContestUsers> findByContestIdAndUserId(Long contestId, String userId);


}
