package com.rakesh.codingbattle.entity;

import com.rakesh.codingbattle.model.QuestionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Data
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class ContestQuestions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long contestId;

    private String url;


    public QuestionDTO from() {
        return QuestionDTO.builder()
                .contestQuestionId(this.getId())
                .url(this.getUrl())
                .build();
    }

}
