package com.rakesh.codingbattle.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@AllArgsConstructor
public class SubmitEvent extends Event{
    private Long contestQuestionId;

    public SubmitEvent() {
        super();
    }

}
