package com.rakesh.codingbattle.controller;

import com.rakesh.codingbattle.controller.request.CreateContestRequest;
import com.rakesh.codingbattle.controller.request.JoinContestRequest;
import com.rakesh.codingbattle.controller.response.Contest;
import com.rakesh.codingbattle.service.ContestService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public String handleMessage(@DestinationVariable String id, String message) {

        System.out.println("Destination: " + id + ", message: " + message);

        return "Success: message " + message;
    }

}
