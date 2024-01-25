package com.rakesh.codingbattle.repository;

import com.rakesh.codingbattle.entity.Contest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContestRepository extends JpaRepository<Contest, Long> {
}
