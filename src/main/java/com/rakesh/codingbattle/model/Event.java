package com.rakesh.codingbattle.model;

import com.rakesh.codingbattle.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Event {

    private EventType eventType;
    private String userId;
}
