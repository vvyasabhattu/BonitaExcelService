package com.evoke.bonita.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evoke.bonita.service.ExpenseService;

@RestController
public class ExcelProcessController {

	@Autowired
	private ExpenseService expenseService;
	
	@GetMapping("getUSMFUGData")
	public 	Map<String, Object> insertUSMFUGData() {
		Map<String ,Object> usDataMap = new HashMap<>();
		List<Map<String, Object>> usmufgData = expenseService.getUSMUFGData();
		usDataMap.put("dashBoardDataList", usmufgData);
		usDataMap.put("allMandatesCount", usmufgData.size());
		return usDataMap;
	}
	
	@GetMapping("getExpenseData")
	public 	Map<String, Object> insertExpenseData(@RequestParam("parentCaseId") Long parentCaseId) {
		Map<String ,Object> expenseDataMap = new HashMap<>();
		List<Map<String, Object>> expenseDatData = expenseService.getExpenseData(parentCaseId);
		expenseDataMap.put("dashBoardDataList", expenseDatData);
		expenseDataMap.put("allMandatesCount", expenseDatData.size());
		return expenseDataMap;
	}
	
	@GetMapping("updateStatus")
	public 	void updateStatus(@RequestParam("caseId") Long caseId) {
		expenseService.updateStatus(caseId);
	}
}
