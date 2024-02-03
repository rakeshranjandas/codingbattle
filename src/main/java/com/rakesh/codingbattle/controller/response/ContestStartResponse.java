package com.rakesh.codingbattle.controller.response;

import com.rakesh.codingbattle.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ContestStartResponse {
    private EventType eventType;
    private long createdAt;
    private String startedBy;
    private long startedAt;
}
