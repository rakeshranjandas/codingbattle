package com.rakesh.codingbattle.repository;

import com.rakesh.codingbattle.entity.ContestUsers;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContestUsersRepository extends JpaRepository<ContestUsers, Long> {
    List<ContestUsers> findByContestId(Long contestId);


}
