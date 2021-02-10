package com.evoke.bonita.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.evoke.bonita.payload.ExpenseBean;

@Component
public class USMUFGService {
	
	@Value("${sourcePathStr}")
	private String sourcePathStr;
	
	@Value("${destPathStr}")
	private String destPathStr;
	
	@Autowired
	private BonitaHandlerService bonitaHandlerService;
	
	@Autowired
	private DataBaseService databaseService;
	
	@Scheduled(fixedRate = 300000)
	public void processExcelData() {
		long caseIdRandom = getRandomInteger(10, 100000);
		sourcePathStr = "C://Users//vvyasabhattu//Desktop//US-MUFG//ExpenseReport.xlsx";
		destPathStr = "C://Users//vvyasabhattu//Desktop//US-MUFG//Processed//ExpenseReport.xlsx";
		Path sourcePath = Paths.get(sourcePathStr);
		Path destPath = Paths.get(destPathStr);
		if(Files.exists(sourcePath)) {
			List<Map<String, Object>> excelDataListFinal = readFromExcel(sourcePathStr, "Sheet1");
			//System.out.println(" Excel Data: "+excelDataListFinal.toString());
			
			SimpleDateFormat sdf  = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss:SSS")	;
			String startDate = sdf.format(new Date());
			Date stDate = new Date();
			
			if(excelDataListFinal.size() > 0) {
				databaseService.createUSMUFG(excelDataListFinal.size(), new File(sourcePathStr).getName(), caseIdRandom, startDate);
				for (Map<String, Object> oneRecord: excelDataListFinal) {
					ExpenseBean eb = new ExpenseBean();
					eb.setParentCaseId(caseIdRandom);
					eb.setAmount(new Double(oneRecord.get("AMOUNT").toString()));
					eb.setEmpName(oneRecord.get("EMP NAME").toString());
					eb.setEmpId(oneRecord.get("EMP ID").toString());
					//TODO: start-date
					bonitaHandlerService.createBonitaCase("", eb);
					//TODO: end-date
				}
				String endDate = sdf.format(new Date());
				Date edDate = new Date();
				long difference_In_Time = Math.abs(edDate.getTime() - stDate.getTime());
				long diffSeconds = difference_In_Time / 1000 ;
				databaseService.updateUSMUFG(excelDataListFinal.size(), caseIdRandom, endDate, diffSeconds+"");
			}
			
			try {
				Files.move (sourcePath, destPath, StandardCopyOption.REPLACE_EXISTING);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		else {
			System.out.println(" Info: No file found for processing! ");
		}
	}
		
	private long getRandomInteger(int maximum, int minimum){ 
		return ((long) (Math.random()*(maximum - minimum))) + minimum; 
	}

	private List<Map<String, Object>> readFromExcel(String filename, String sheetName) {
		FileInputStream inputStream = null;
		try {
			inputStream = new FileInputStream(new File(filename));
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		}

		List<Map<String, Object>> excelDataList = new ArrayList<>();
		Map<Integer, String> headersMap = new LinkedHashMap<>();

		Workbook workbook = null;
		try {
			workbook = new XSSFWorkbook(inputStream);
		} catch (IOException e) {
			e.printStackTrace();
		}
		Sheet firstSheet = workbook.getSheet(sheetName);
		Iterator<Row> iterator = firstSheet.iterator();

		// iterator.next();
		boolean isHeader = true;
		while (iterator.hasNext()) {
			Map<String, Object> oneMap = new LinkedHashMap<>();
			int count = 0;
			// iterator.next();
			Row nextRow = iterator.next();
			// Iterator<Cell> cellIterator = nextRow.cellIterator();
			// while (cellIterator.hasNext()) {
			for (int cn = 0; cn < nextRow.getLastCellNum(); cn++) {
				Object value = null;
				// Cell cell = cellIterator.next();
				Cell cell = nextRow.getCell(cn, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
				// System.out.println("Count: "+ count +" Column Index:
				// "+cell.getColumnIndex());
				value = getCellVlue(cell);
				if (isHeader) {
					headersMap.put(count, value.toString());
				} else {
					oneMap.put(headersMap.get(count), value);
				}
				count++;
				// System.out.print(" - ");
			}
			if (!isHeader)
				excelDataList.add(oneMap);
			isHeader = false;
			// System.out.println();
		}
		try {
			workbook.close();
			inputStream.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return excelDataList;
	}

	private Object getCellVlue(Cell cell) {
		Object value = null;
		// System.out.println("cell.getCellType(): "+cell.getCellType());
		switch (cell.getCellType()) {
		case STRING:
			value = cell.getStringCellValue();
			// System.out.println(" Cell Value: "+value);
			break;
		case BOOLEAN:
			value = cell.getBooleanCellValue();
			// System.out.println(" Cell Value: "+value);
			break;
		case NUMERIC:
			// value = (int) cell.getNumericCellValue();
			if (DateUtil.isCellDateFormatted(cell)) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
				value = dateFormat.format(cell.getDateCellValue());
				// System.out.println(" Cell Value: "+value);
			} else {
				// System.out.println("else Cell Value 121212: "+cell.getNumericCellValue());
				value = (int) cell.getNumericCellValue();
				// System.out.println("else Cell Value: "+value);
			}
			// System.out.println(" Cell Value: "+value);
			break;
		case BLANK:
			value = "";
			// System.out.println(" Cell Value: "+value);
			break;
		default:
			value = "";
			// System.out.println(" Cell Value: "+value);
			break;
		}

		return value;
	}
}
