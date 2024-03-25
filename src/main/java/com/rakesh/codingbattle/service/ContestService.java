package com.rakesh.codingbattle.service;

import com.rakesh.codingbattle.controller.request.CreateContestRequest;
import com.rakesh.codingbattle.controller.request.JoinContestRequest;
import com.rakesh.codingbattle.controller.response.Contest;
import com.rakesh.codingbattle.controller.response.ContestStartResponse;
import com.rakesh.codingbattle.entity.ContestQuestions;
import com.rakesh.codingbattle.entity.ContestUsers;
import com.rakesh.codingbattle.enums.ContestStatus;
import com.rakesh.codingbattle.enums.EventType;
import com.rakesh.codingbattle.model.Event;
import com.rakesh.codingbattle.model.UserDTO;
import com.rakesh.codingbattle.repository.ContestQuestionsRepository;
import com.rakesh.codingbattle.repository.ContestRepository;
import com.rakesh.codingbattle.repository.ContestUsersRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import javax.transaction.Transactional;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@AllArgsConstructor
@Service
public class ContestService {

    private final SimpMessagingTemplate messagingTemplate;

    private final ContestRepository contestRepository;

    private final ContestQuestionsRepository contestQuestionsRepository;

    private final ContestUsersRepository contestUsersRepository;


    @Transactional(rollbackOn =  Exception.class)
    public Contest createContest(CreateContestRequest createContestRequest) {

        // Create Contest -> Get Contest id -> Save in ContestQuestions, Save in ContestUsers
        com.rakesh.codingbattle.entity.Contest contest = new com.rakesh.codingbattle.entity.Contest();
        contest.setCreatedBy(createContestRequest.getUserId());
        contest.setContestStatus(ContestStatus.NOT_STARTED);
        contest.setCreatedAt(Instant.now().toEpochMilli());
        contest.setDuration(createContestRequest.getDuration());

        var contestSaved = contestRepository.save(contest);
        var contestSavedId = contestSaved.getId();

        List<ContestQuestions> contestQuestionsToSave = new ArrayList<>();

        for(var questionDTO: createContestRequest.getQuestions()) {

            ContestQuestions contestQuestions = new ContestQuestions();
            contestQuestions.setContestId(contestSavedId);
            contestQuestions.setUrl(questionDTO.getUrl());

            contestQuestionsToSave.add(contestQuestions);

        }

        var contestQuestionsSaved = contestQuestionsRepository.saveAll(contestQuestionsToSave);

        ContestUsers contestUsers = new ContestUsers();
        contestUsers.setContestId(contestSavedId);
        contestUsers.setUserId(createContestRequest.getUserId());
        contestUsersRepository.save(contestUsers);

        Contest contestResponse = new Contest();
        contestResponse.setQuestions(contestQuestionsSaved.stream().map(ContestQuestions::from).collect(Collectors.toList()));
        contestResponse.setSessionId(String.valueOf(contestSavedId));
        contestResponse.setUsers(List.of(new UserDTO(createContestRequest.getUserId())));
        contestResponse.setDuration(contestSaved.getDuration());

        return contestResponse;
    }

    public Contest joinContest(JoinContestRequest joinContestRequest) {

        var contestId = Long.parseLong(joinContestRequest.getSessionId());
        var userId = joinContestRequest.getUserId();

        ContestUsers contestUsers = contestUsersRepository.findByContestIdAndUserId(contestId, userId).orElse(null);
        if (contestUsers == null) {
            contestUsers = new ContestUsers();
            contestUsers.setContestId(contestId);
            contestUsers.setUserId(userId);
            contestUsersRepository.save(contestUsers);
        }

        var contestQuestionsList = contestQuestionsRepository.findByContestId(contestId);
        var contestUsersList = contestUsersRepository.findByContestId(contestId);
        var contest = contestRepository.findById(Long.parseLong(joinContestRequest.getSessionId()))
                .orElse(new com.rakesh.codingbattle.entity.Contest());
        Contest contestResponse = new Contest();
        contestResponse.setQuestions(contestQuestionsList.stream().map(ContestQuestions::from).collect(Collectors.toList()));
        contestResponse.setSessionId(String.valueOf(contestId));
        contestResponse.setUsers(contestUsersList.stream().map((contestUser) -> UserDTO.builder().userId(contestUser.getUserId()).build()).collect(Collectors.toList()));
        contestResponse.setDuration(contest.getDuration());
        return contestResponse;
    }

    @Transactional
    public ContestStartResponse handleStartMessage(String id, Event event) {


            var contest = contestRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Invalid contest id"));

            contest.setContestStatus(ContestStatus.RUNNING);
            long startTime = Instant.now().plusSeconds(10).toEpochMilli();
            contest.setStartedAt(startTime);
            var scheduler = Executors.newScheduledThreadPool(1);
            scheduler.schedule(() -> closeWebSocketAfterDuration(id, contest, scheduler), contest.getDuration(), TimeUnit.MINUTES);
            var savedContest = contestRepository.save(contest);
            return ContestStartResponse.builder()
                    .eventType(EventType.CONTEST_START)
                    .startedAt(savedContest.getStartedAt())
                    .startedBy(event.getUserId())
                    .build();

    }

    private void closeWebSocketAfterDuration(String id, com.rakesh.codingbattle.entity.Contest contest, ScheduledExecutorService scheduler) {
        log.info("Close socket invoked");
        messagingTemplate.convertAndSend("/cb-topic/"+id, new Event(EventType.CONTEST_END, "SYSTEM"));
        contest.setContestStatus(ContestStatus.ENDED);
        log.info("Contest id {} ended at {}", contest.getId(), Instant.now());
        scheduler.shutdownNow();
    }

}
