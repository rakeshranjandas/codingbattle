package com.rakesh.codingbattle.entity;


import com.rakesh.codingbattle.enums.ContestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO : make dynamic
    private String name = "A Simple Contest";
    private String createdBy;
    private long createdAt;
    private long startedAt;
    private ContestStatus contestStatus;
    private int duration;

}
