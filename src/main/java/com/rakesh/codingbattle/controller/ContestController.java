package com.rakesh.codingbattle.controller;

import com.rakesh.codingbattle.controller.request.CreateContestRequest;
import com.rakesh.codingbattle.controller.request.JoinContestRequest;
import com.rakesh.codingbattle.controller.response.Contest;
import com.rakesh.codingbattle.service.ContestService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("v1/contest")
public class ContestController {


    private ContestService contestService;

    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }

    @PostMapping
    public Contest createContest(@RequestBody CreateContestRequest createContestRequest) {

        return contestService.createContest(createContestRequest);

    }

    @PostMapping("/join")
    public Contest joinContest(@RequestBody JoinContestRequest joinContestRequest) {

        return contestService.joinContest(joinContestRequest);

    }

}
