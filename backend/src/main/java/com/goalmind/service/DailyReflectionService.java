package com.goalmind.service;

import com.goalmind.dto.DailyReflectionRequest;
import com.goalmind.dto.DailyReflectionResponse;
import com.goalmind.model.DailyReflection;
import com.goalmind.model.User;
import com.goalmind.repository.DailyReflectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DailyReflectionService {

    private final DailyReflectionRepository dailyReflectionRepository;

    public DailyReflectionService(DailyReflectionRepository dailyReflectionRepository) {
        this.dailyReflectionRepository = dailyReflectionRepository;
    }

    @Transactional
    public DailyReflectionResponse saveReflection(User user, DailyReflectionRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        Optional<DailyReflection> existing = dailyReflectionRepository.findByUserIdAndDate(user.getId(), date);
        DailyReflection reflection = existing.orElseGet(() -> {
            DailyReflection r = new DailyReflection();
            r.setUser(user);
            r.setDate(date);
            return r;
        });

        reflection.setAccomplishments(request.getAccomplishments());
        reflection.setBlockers(request.getBlockers());
        reflection.setLearnings(request.getLearnings());
        reflection.setImprovementsForTomorrow(request.getImprovementsForTomorrow());

        DailyReflection saved = dailyReflectionRepository.save(reflection);
        return mapToResponse(saved);
    }

    public DailyReflectionResponse getReflectionByDate(User user, LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return dailyReflectionRepository.findByUserIdAndDate(user.getId(), queryDate)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public List<DailyReflectionResponse> getRecentReflections(User user, int limit) {
        List<DailyReflection> list = dailyReflectionRepository.findByUserIdOrderByDateDesc(user.getId());
        return list.stream().limit(limit > 0 ? limit : 30).map(this::mapToResponse).toList();
    }

    private DailyReflectionResponse mapToResponse(DailyReflection r) {
        DailyReflectionResponse response = new DailyReflectionResponse();
        response.setId(r.getId());
        response.setDate(r.getDate());
        response.setAccomplishments(r.getAccomplishments());
        response.setBlockers(r.getBlockers());
        response.setLearnings(r.getLearnings());
        response.setImprovementsForTomorrow(r.getImprovementsForTomorrow());
        response.setCreatedAt(r.getCreatedAt());
        response.setUpdatedAt(r.getUpdatedAt());
        return response;
    }
}
