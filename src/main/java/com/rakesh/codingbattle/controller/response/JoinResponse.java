package com.rakesh.codingbattle.controller.response;

import com.rakesh.codingbattle.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class JoinResponse {
    private String userId;
    private final EventType eventType = EventType.JOIN;

}
