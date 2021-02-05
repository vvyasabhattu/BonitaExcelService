package com.evoke.bonita.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
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
		//	Class.forName(DBConstants.GET_DATA_BASE_DRIVER);
			conn = DriverManager.getConnection(DBConstants.GET_DATA_BASE_DRIVER, DBConstants.GET_DATA_BASE_USER,
					DBConstants.GET_DATA_BASE_PASSWORD);
			PreparedStatement ps = conn.prepareStatement("select * from USMUFG order by caseId desc");
			resultSet = ps.executeQuery();
			// setting query input'sGET_ENTITY
			ResultSetMetaData rsMetaData = resultSet.getMetaData();
			int columnCount = rsMetaData.getColumnCount();
			if (resultSet != null) {
				Map<String, Object> requestMap = new HashMap<String, Object>();
				while (resultSet.next()) {

					for (int i = 0; i < columnCount; i++) {
						requestMap.put(rsMetaData.getColumnName(i + 1), resultSet.getObject(i + 1));
						listOfFiles.add(requestMap);
					}
					System.out.println("requestMap:::" + requestMap);
				}

			}

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
	
	
	public List<Map<String, Object>> getExpenseData(Long parentCaseId) {
		ResultSet resultSet = null;
		Connection conn = null;

		List<Map<String, Object>> listOfFiles = new ArrayList<Map<String, Object>>();
		try {
		//	Class.forName(DBConstants.GET_DATA_BASE_DRIVER);
			conn = DriverManager.getConnection(DBConstants.GET_DATA_BASE_DRIVER, DBConstants.GET_DATA_BASE_USER,
					DBConstants.GET_DATA_BASE_PASSWORD);
			PreparedStatement ps = conn.prepareStatement("select * from USMUFG where parentCaseId=?");
			ps.setLong(1, parentCaseId);
			resultSet = ps.executeQuery();
			// setting query input'sGET_ENTITY
			ResultSetMetaData rsMetaData = resultSet.getMetaData();
			int columnCount = rsMetaData.getColumnCount();
			if (resultSet != null) {
				Map<String, Object> requestMap = new HashMap<String, Object>();
				while (resultSet.next()) {

					for (int i = 0; i < columnCount; i++) {
						requestMap.put(rsMetaData.getColumnName(i + 1), resultSet.getObject(i + 1));
						listOfFiles.add(requestMap);
					}
					System.out.println("requestMap:::" + requestMap);
				}

			}

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
