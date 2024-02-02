package com.rakesh.codingbattle.controller.response;

import com.rakesh.codingbattle.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ContestSubmitResponse {
    private final EventType eventType = EventType.SUBMIT_AC;
    private String userId;
    private Long contestQuestionId;
    private Long submittedAt;
}
