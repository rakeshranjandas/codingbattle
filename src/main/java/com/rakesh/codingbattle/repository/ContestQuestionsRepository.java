package com.rakesh.codingbattle.repository;

import com.rakesh.codingbattle.entity.ContestQuestions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContestQuestionsRepository extends JpaRepository<ContestQuestions, Long> {
    List<ContestQuestions> findByContestId(Long contestId);



}
