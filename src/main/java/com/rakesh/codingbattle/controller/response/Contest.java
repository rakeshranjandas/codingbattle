package com.rakesh.codingbattle.controller.response;

import com.rakesh.codingbattle.model.QuestionDTO;
import com.rakesh.codingbattle.model.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Contest {

    private List<QuestionDTO> questions;

    private String sessionId;

    private List<UserDTO> users;

}
