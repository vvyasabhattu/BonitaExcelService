package com.evoke.bonita.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.evoke.bonita.constants.DBConstants;

@Service
public class ExpenseService {

	
	public List<Map<String, Object>> getUSMUFGData() {
		ResultSet resultSet = null;
		Connection conn = null;

		List<Map<String, Object>> listOfFiles = new ArrayList<Map<String, Object>>();
		try {
		Class.forName(DBConstants.GET_DATA_BASE_DRIVER);
			conn = DriverManager.getConnection(DBConstants.GET_DATA_BASE_URL, DBConstants.GET_DATA_BASE_USER,
					DBConstants.GET_DATA_BASE_PASSWORD);
			PreparedStatement ps = conn.prepareStatement("select * from USMUFG order by caseId desc");
			resultSet = ps.executeQuery();
			ResultSetMetaData rsmd = resultSet.getMetaData();
			listOfFiles = convertResultSetToList(rsmd, resultSet);

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (resultSet != null) {
					resultSet.close();
				}

				if (conn != null) {
					conn.close();
				}

			} catch (SQLException e) {
			}
		}

		return listOfFiles;
	}
	
	private List<Map<String, Object>>  convertResultSetToList(ResultSetMetaData rsmd, ResultSet resultSet)
	{
		int colCount = 1;
		int rowIndex = 0;
		Object columnObject = null;
		List<Object> rowData = null;
		Map<String, Object> interMap = null;
		List<Map<String, Object>> finalList = new LinkedList<>();
		
		try
		{
			while (resultSet.next())
			{
				rowIndex++;
				colCount = 1;
				rowData = new ArrayList<>();
	
				for (int i = 1; i <= rsmd.getColumnCount(); i++)
				{
					rowData.add(resultSet.getObject(i));
				}
				interMap = new LinkedHashMap();
				for (int colIndex = 0; colIndex < rsmd.getColumnCount(); colIndex++)
				{
					columnObject = rowData.get(colIndex);
					if (columnObject != null)
					{
						interMap.put(rsmd.getColumnLabel(colCount), columnObject);
					}
					
					colCount++;
				}
				finalList.add(interMap);
			}
		}
		catch (Exception e)
		{
		}
		return finalList;
	}
	public List<Map<String, Object>> getExpenseData(Long parentCaseId) {
		ResultSet resultSet = null;
		Connection conn = null;

		List<Map<String, Object>> listOfFiles = new ArrayList<Map<String, Object>>();
		try {
			Class.forName(DBConstants.GET_DATA_BASE_DRIVER);
			conn = DriverManager.getConnection(DBConstants.GET_DATA_BASE_URL, DBConstants.GET_DATA_BASE_USER,
					DBConstants.GET_DATA_BASE_PASSWORD);
			PreparedStatement ps = conn.prepareStatement("select * from ExpenseReport where parentCaseId=?");
			ps.setLong(1, parentCaseId);
			resultSet = ps.executeQuery();
			ResultSetMetaData rsmd = resultSet.getMetaData();
			listOfFiles = convertResultSetToList(rsmd, resultSet);

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (resultSet != null) {
					resultSet.close();
				}

				if (conn != null) {
					conn.close();
				}

			} catch (SQLException e) {
			}
		}

		return listOfFiles;
	}
}
