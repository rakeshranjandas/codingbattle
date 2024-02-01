package com.rakesh.codingbattle.repository;

import com.rakesh.codingbattle.entity.ContestQuestions;
import com.rakesh.codingbattle.entity.UserQuestions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserQuestionsRepository extends JpaRepository<UserQuestions, Long> {

}
