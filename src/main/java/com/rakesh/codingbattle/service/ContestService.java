package com.rakesh.codingbattle.service;

import com.rakesh.codingbattle.controller.request.CreateContestRequest;
import com.rakesh.codingbattle.controller.request.JoinContestRequest;
import com.rakesh.codingbattle.controller.response.Contest;
import com.rakesh.codingbattle.entity.ContestQuestions;
import com.rakesh.codingbattle.entity.ContestUsers;
import com.rakesh.codingbattle.model.QuestionDTO;
import com.rakesh.codingbattle.model.UserDTO;
import com.rakesh.codingbattle.repository.ContestQuestionsRepository;
import com.rakesh.codingbattle.repository.ContestRepository;
import com.rakesh.codingbattle.repository.ContestUsersRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class ContestService {

    private ContestRepository contestRepository;

    private ContestQuestionsRepository contestQuestionsRepository;

    private ContestUsersRepository contestUsersRepository;

    @Transactional(dontRollbackOn =  Exception.class)
    public Contest createContest(CreateContestRequest createContestRequest) {

        // Create Contest -> Get Contest id -> Save in ContestQuestions, Save in ContestUsers
        com.rakesh.codingbattle.entity.Contest contest = new com.rakesh.codingbattle.entity.Contest();
        contest.setCreatedBy(createContestRequest.getUserId());

        var contestSaved = contestRepository.save(contest);
        var contestSavedId = contestSaved.getId();

        List<ContestQuestions> contestQuestionsToSave = new ArrayList<>();

        for(var questionDTO: createContestRequest.getQuestionDTOS()) {

            ContestQuestions contestQuestions = new ContestQuestions();
            contestQuestions.setContestId(contestSavedId);
            contestQuestions.setUrl(questionDTO.getUrl());

            contestQuestionsToSave.add(contestQuestions);

        }

        contestQuestionsRepository.saveAll(contestQuestionsToSave);

        ContestUsers contestUsers = new ContestUsers();
        contestUsers.setContestId(contestSavedId);
        contestUsers.setUserId(createContestRequest.getUserId());
        contestUsersRepository.save(contestUsers);

        Contest contestResponse = new Contest();
        contestResponse.setQuestions(createContestRequest.getQuestionDTOS());
        contestResponse.setSessionId(String.valueOf(contestSavedId));
        contestResponse.setUsers(List.of(new UserDTO(createContestRequest.getUserId())));

        return contestResponse;
    }

    public Contest joinContest(JoinContestRequest joinContestRequest) {

        var contestId = Long.parseLong(joinContestRequest.getSessionId());

        ContestUsers contestUsers = new ContestUsers();
        contestUsers.setContestId(contestId);
        contestUsers.setUserId(joinContestRequest.getUserId());
        contestUsersRepository.save(contestUsers);

        var contestQuestionsList = contestQuestionsRepository.findByContestId(contestId);
        var contestUsersList = contestUsersRepository.findByContestId(contestId);

        Contest contestResponse = new Contest();
        contestResponse.setQuestions(contestQuestionsList.stream().map((contestQuestions) -> QuestionDTO.builder().url(contestQuestions.getUrl()).build()).collect(Collectors.toList())); ;
        contestResponse.setSessionId(String.valueOf(contestId));
        contestResponse.setUsers(contestUsersList.stream().map((contestUser) -> UserDTO.builder().userId(contestUser.getUserId()).build()).collect(Collectors.toList()));

        return contestResponse;
    }
}
