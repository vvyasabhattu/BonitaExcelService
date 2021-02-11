package com.evoke.bonita.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
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
import java.util.Set;
import java.util.TreeMap;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
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
		sourcePathStr = "C://Users//vvyasabhattu//Desktop//US-MUFG//DataFiles//ExpenseReport.xlsx";
		destPathStr = "C://Users//vvyasabhattu//Desktop//US-MUFG//DataFiles//Processed//ExpenseReport.xlsx";
		Path sourcePath = Paths.get(sourcePathStr);
		Path destPath = Paths.get(destPathStr);
		if(Files.exists(sourcePath)) {
			List<Map<String, Object>> excelDataListFinal = readFromExcel(sourcePathStr, "Sheet1");
			//System.out.println(" Excel Data: "+excelDataListFinal.toString());
			
			SimpleDateFormat sdf  = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss:SSS")	;
			String startDate = sdf.format(new Date());
			Date stDate = new Date();
			List<Map<String, Object>> errorList = new ArrayList<>(); 
			
			if(excelDataListFinal.size() > 0) {
				databaseService.createUSMUFG(excelDataListFinal.size(), new File(sourcePathStr).getName(), caseIdRandom, startDate);
				for (Map<String, Object> oneRecord: excelDataListFinal) {
					if(		(oneRecord.get("AMOUNT") != null && isNumeric(oneRecord.get("AMOUNT").toString()))
						&&  (oneRecord.get("EMP ID") != null && isNumeric(oneRecord.get("EMP ID").toString())) ) {
						ExpenseBean eb = new ExpenseBean();
						eb.setParentCaseId(caseIdRandom);
						eb.setAmount(new Double(oneRecord.get("AMOUNT").toString()));
						eb.setEmpName(oneRecord.get("EMP NAME").toString());
						eb.setEmpId(oneRecord.get("EMP ID").toString());
						bonitaHandlerService.createBonitaCase("", eb);
					}
					else {
						errorList.add(oneRecord);
					}
				}
				
				if(errorList.size() > 0) {
					writeToExcel(errorList);
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
	
	private boolean isNumeric(String strNum) {
	    if (strNum == null) {
	        return false;
	    }
	    try {
	        Double.parseDouble(strNum);
	    } catch (NumberFormatException nfe) {
	        return false;
	    }
	    return true;
	}
	
	private void writeToExcel(List<Map<String, Object>> dataList) {
		//Create blank workbook
	      XSSFWorkbook workbook = new XSSFWorkbook();
	      
	      //Create a blank sheet
	      XSSFSheet spreadsheet = workbook.createSheet("Error Data");

	      //Create row object
	      XSSFRow row;

	      //This data needs to be written (Object[])
	      Map <String, Object[] > empinfo = new TreeMap < String, Object[] >();
	      empinfo.put( "1", new Object[] {"EMP ID", "EMP NAME", "AMOUNT"});
	      int number = 2;
	      
	      for(Map<String, Object> oneRow : dataList) {
	    	  empinfo.put( number+"", new Object[] {oneRow.get("EMP ID"), oneRow.get("EMP NAME"), oneRow.get("AMOUNT")});
	    	  number++;
	      }

	      //Iterate over data and write to sheet
	      Set < String > keyid = empinfo.keySet();
	      int rowid = 0;
	      
	      for (String key : keyid) {
	         row = spreadsheet.createRow(rowid++);
	         Object [] objectArr = empinfo.get(key);
	         int cellid = 0;
	         
	         for (Object obj : objectArr){
	            Cell cell = row.createCell(cellid++);
	            //cell.setCellValue(obj);
	            if (obj instanceof String) {
                    cell.setCellValue((String) obj);
                } else if (obj instanceof Integer) {
                    cell.setCellValue((Integer) obj);
                }
	         }
	      }
	      //Write the workbook in file system
	      FileOutputStream out;
		try {
			out = new FileOutputStream(new File("C://Users//vvyasabhattu//Desktop//US-MUFG//DataFiles//ErrorDataFile.xlsx"));
			workbook.write(out);
		    workbook.close();
		    out.close();
		    System.out.println("Writesheet.xlsx written successfully");
		} catch (Exception e) {
			e.printStackTrace();
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
