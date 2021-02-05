package com.evoke.bonita.payload;

import java.time.LocalDateTime;

public class USMUFGBean {
	
	private Long caseId;
	private Long recordCount;
	private Long processedCount;
	private String fileName ;
	private String createdBy;
	private String timeDifference;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	public Long getCaseId() {
		return caseId;
	}
	public void setCaseId(Long caseId) {
		this.caseId = caseId;
	}
	public Long getRecordCount() {
		return recordCount;
	}
	public void setRecordCount(Long recordCount) {
		this.recordCount = recordCount;
	}
	public Long getProcessedCount() {
		return processedCount;
	}
	public void setProcessedCount(Long processedCount) {
		this.processedCount = processedCount;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
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
