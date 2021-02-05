package com.evoke.bonita.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class USMUFGService {
	
	@Scheduled(fixedRate = 60000)
	public void processExcelData() {
		
	}

}
