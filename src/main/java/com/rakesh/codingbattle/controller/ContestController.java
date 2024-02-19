package com.rakesh.codingbattle.controller;

import com.rakesh.codingbattle.controller.request.CreateContestRequest;
import com.rakesh.codingbattle.controller.request.JoinContestRequest;
import com.rakesh.codingbattle.controller.response.Contest;
import com.rakesh.codingbattle.controller.response.ContestStartResponse;
import com.rakesh.codingbattle.controller.response.ContestSubmitResponse;
import com.rakesh.codingbattle.controller.response.JoinResponse;
import com.rakesh.codingbattle.model.Event;
import com.rakesh.codingbattle.model.SubmitEvent;
import com.rakesh.codingbattle.service.ContestService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@AllArgsConstructor
@RestController
@RequestMapping("v1/contest")
public class ContestController {


    private ContestService contestService;

    @PostMapping
    public Contest createContest(@RequestBody CreateContestRequest createContestRequest) {
        return contestService.createContest(createContestRequest);
    }

    @PostMapping("/join")
    public Contest joinContest(@RequestBody JoinContestRequest joinContestRequest) {
        return contestService.joinContest(joinContestRequest);
    }

    @MessageMapping("/contest/{id}")
    @SendTo("/cb-topic/{id}")
    public JoinResponse handleJoinMessage(@DestinationVariable String id, Event event) {
        return new JoinResponse(event.getUserId());
    }

    @MessageMapping("/contest/{id}/start")
    @SendTo("/cb-topic/{id}")
    public ContestStartResponse handleStartMessage(@DestinationVariable String id, Event event) {
        return contestService.handleStartMessage(id, event);
    }

    @MessageMapping("/contest/{id}/submit")
    @SendTo("/cb-topic/{id}")
    public ContestSubmitResponse handleSubmitMessage(@DestinationVariable String id, SubmitEvent event) {
        // TODO: DB
        return ContestSubmitResponse.builder()
                .contestQuestionId(event.getContestQuestionId())
                .submittedAt(Instant.now().toEpochMilli())
                .userId(event.getUserId())
                .build();
    }

}
