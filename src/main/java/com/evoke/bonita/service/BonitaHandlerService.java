package com.evoke.bonita.service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.bonitasoft.engine.api.ApiAccessType;
import org.bonitasoft.engine.api.LoginAPI;
import org.bonitasoft.engine.api.ProcessAPI;
import org.bonitasoft.engine.api.TenantAPIAccessor;
import org.bonitasoft.engine.bpm.contract.ContractViolationException;
import org.bonitasoft.engine.bpm.process.ProcessActivationException;
import org.bonitasoft.engine.bpm.process.ProcessDefinitionNotFoundException;
import org.bonitasoft.engine.bpm.process.ProcessExecutionException;
import org.bonitasoft.engine.bpm.process.ProcessInstance;
import org.bonitasoft.engine.exception.BonitaHomeNotSetException;
import org.bonitasoft.engine.exception.ServerAPIException;
import org.bonitasoft.engine.exception.UnknownAPITypeException;
import org.bonitasoft.engine.platform.LoginException;
import org.bonitasoft.engine.session.APISession;
import org.bonitasoft.engine.util.APITypeManager;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.evoke.bonita.payload.ExpenseBean;

@Component
public class BonitaHandlerService {
//	bonita.localurl

	@Value("${bonita.env}")
	private String env;

	@Value("${bonita.localurl}")
	private String localURL;
	
	@Value("${bonita.devurl}")
	private String devURL;
	
	@Value("${bonita.uaturl}")
	private String uatURL;

	@Value("${bonita.produrl}")
	private String prodURL;
	
	@Value("${bonita.process.name}")
	private String processName;
	
	@Value("${bonita.process.version}")
	private String processVersion;
	
	@Autowired
	private DataBaseService dataBaseService;

	private String getBonitaBaseURL() {
		String bonitaServerURL;
		if (env.equalsIgnoreCase("dev")) {
			bonitaServerURL = devURL;
		} else if (env.equalsIgnoreCase("uat")) {
			bonitaServerURL = uatURL;
		} else if (env.equalsIgnoreCase("prod")) {
			bonitaServerURL = prodURL;
		} else {
			bonitaServerURL = localURL;
		}
		return bonitaServerURL;
	}

	@SuppressWarnings("unchecked")
	public Long createBonitaCase(String username, ExpenseBean expenseBean) {
		Map<String, String> settings = new HashMap<String, String>();
		String bonitaServerURL = "";
		Long caseId = 0L;
		bonitaServerURL = getBonitaBaseURL();
		settings.put("server.url", bonitaServerURL);
		settings.put("application.name", "bonita");
		APITypeManager.setAPITypeAndParams(ApiAccessType.HTTP, settings);
		LoginAPI loginAPI;
		 APISession apiSession = null;
		try {
			loginAPI = TenantAPIAccessor.getLoginAPI();
			if(username != null && username != "" ) {
				 apiSession = loginAPI.login(username, "bpm");
				
			}else {
				 apiSession = loginAPI.login("walter.bates", "bpm");
			}
			
			//APISession apiSession = loginAPI.login("c-gopalr", "bpm");
			ProcessAPI processAPI = TenantAPIAccessor.getProcessAPI(apiSession);
			Long userId = apiSession.getUserId();
			if (userId > 0) {
				long processDefinitionId = getProcessDefinitionId(processAPI);
				JSONObject contract = new JSONObject();
				contract.put("parentCaseId", expenseBean.getParentCaseId());
				contract.put("amount", expenseBean.getAmount());
				contract.put("empId", expenseBean.getEmpId());
				contract.put("empName", expenseBean.getEmpName());
				
				SimpleDateFormat sdf  = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss:SSS")	;
				
				if(processDefinitionId > 0) {
					String startDate = sdf.format(new Date());
					System.out.println("Case creation started on : "+startDate);
					contract.put("startDate", startDate);
					ProcessInstance createCase = createCase(processAPI, processDefinitionId,contract,userId);
					caseId = createCase.getRootProcessInstanceId();
					String endDate = sdf.format(createCase.getStartDate());
					contract.put("caseId", caseId);
					contract.put("endDate", endDate);

					long diffInMillies = Math.abs(sdf.parse(endDate).getTime() - sdf.parse(startDate).getTime());
					long diff = TimeUnit.MILLISECONDS.convert(diffInMillies, TimeUnit.MILLISECONDS);
					contract.put("caseTimeDiff", diff);
					if(caseId > 0) {
						dataBaseService.createExpenseReport(contract);
					}
					System.out.println("Case created with id : "+createCase.getRootProcessInstanceId() + " on : "+endDate);
				}
			}

		} catch (BonitaHomeNotSetException | ServerAPIException | UnknownAPITypeException e) {
			e.printStackTrace();
		} catch (LoginException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return caseId;
	}
	
	

	
	/**
	 * 
	 * @param context
	 * @param processDefinitionId
	 * @param contract
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private org.bonitasoft.engine.bpm.process.ProcessInstance createCase(ProcessAPI processAPI, long processDefinitionId, JSONObject contract,Long userId) {
		 ProcessInstance startProcessWithInputs = null;
		try {
			startProcessWithInputs = processAPI.startProcessWithInputs(userId, processDefinitionId, contract);
		} catch (ProcessDefinitionNotFoundException e) {
			e.printStackTrace();
		} catch (ProcessActivationException e) {
			e.printStackTrace();
		} catch (ProcessExecutionException e) {
			e.printStackTrace();
		} catch (ContractViolationException e) {
			e.printStackTrace();
		}
		return startProcessWithInputs;
	}
	/**
	 * 
	 * @param context
	 * @return
	 */
	private long getProcessDefinitionId(ProcessAPI processAPI) {

		long processDefinitionId = 0;
		try {
			processDefinitionId = processAPI.getProcessDefinitionId(processName, processVersion);
		} catch (ProcessDefinitionNotFoundException e) {
			e.printStackTrace();
		}
		return processDefinitionId;
	}

}
