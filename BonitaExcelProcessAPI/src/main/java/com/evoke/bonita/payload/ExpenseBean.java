package com.evoke.bonita.payload;

import java.time.LocalDateTime;

public class ExpenseBean {
	
	private Long parentCaseId;
	private Long caseId;
	private String empId;
	private Double amount;
	private String empName ;
	private String assignedTo;
	private String status;
	private String timeDifference;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	
	public Long getParentCaseId() {
		return parentCaseId;
	}
	public void setParentCaseId(Long parentCaseId) {
		this.parentCaseId = parentCaseId;
	}
	public Long getCaseId() {
		return caseId;
	}
	public void setCaseId(Long caseId) {
		this.caseId = caseId;
	}
	public String getEmpId() {
		return empId;
	}
	public void setEmpId(String empId) {
		this.empId = empId;
	}
	public Double getAmount() {
		return amount;
	}
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	public String getEmpName() {
		return empName;
	}
	public void setEmpName(String empName) {
		this.empName = empName;
	}
	public String getAssignedTo() {
		return assignedTo;
	}
	public void setAssignedTo(String assignedTo) {
		this.assignedTo = assignedTo;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getTimeDifference() {
		return timeDifference;
	}
	public void setTimeDifference(String timeDifference) {
		this.timeDifference = timeDifference;
	}
	public LocalDateTime getStartDate() {
		return startDate;
	}
	public void setStartDate(LocalDateTime startDate) {
		this.startDate = startDate;
	}
	public LocalDateTime getEndDate() {
		return endDate;
	}
	public void setEndDate(LocalDateTime endDate) {
		this.endDate = endDate;
	}
	
}
