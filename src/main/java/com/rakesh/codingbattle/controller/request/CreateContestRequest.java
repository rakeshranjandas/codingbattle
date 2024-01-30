package com.rakesh.codingbattle.controller.request;

import com.rakesh.codingbattle.model.QuestionDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateContestRequest {

    private List<QuestionDTO> questions;

    private String userId;

}
