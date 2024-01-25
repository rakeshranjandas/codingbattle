package com.rakesh.codingbattle.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionDTO {

    private String url;

    private String name;

}
