package com.rakesh.codingbattle.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
public class StartEvent extends Event{

    @Builder.Default
    private int durationInMins = 60;

}
