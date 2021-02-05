package com.evoke.bonita.service;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.evoke.bonita.constants.DBConstants;



@Service
public class DataBaseService {

	@Value("${bonita.env}")
	private String env;

	
	
	public void insertFileTrackerToWorkFLow(String fileName, String caseId, String documentType,
			String documentOrginated, String path) 
	{
		Connection conn = null;

		try {
			////Class.forName(DBConstants.GET_DATA_BASE_DRIVER);
			conn = DriverManager.getConnection(DBConstants.GET_DATA_BASE_URL, DBConstants.GET_DATA_BASE_USER,
					DBConstants.GET_DATA_BASE_PASSWORD);

			PreparedStatement ps = conn.prepareStatement(
					"INSERT INTO DOCUMENTINFO (NAME,DOCUMENTPATH,CASEID,TYPE,UPLOADEDON,UPLOADEDBY) VALUES (?,?,?,?,?,?)");
			ps.setString(1, fileName);
			ps.setString(2, path);
			ps.setString(3, caseId);
			ps.setString(4, documentType);
			ps.setString(6, documentOrginated);
			ps.setDate(5, new Date(System.currentTimeMillis()));

			ps.executeUpdate();

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}

	public List<Map<String, Object>> getUplodedFiles(String caseId) {
		ResultSet resultSet = null;
		Connection conn = null;

		List<Map<String, Object>> listOfFiles = new ArrayList<Map<String, Object>>();
		try {
			////Class.forName(DBConstants.GET_DATA_BASE_DRIVER);
			conn = DriverManager.getConnection(DBConstants.GET_DATA_BASE_SME_URL, DBConstants.GET_DATA_BASE_USER,
					DBConstants.GET_DATA_BASE_PASSWORD);
			PreparedStatement ps = conn.prepareStatement("select * from DOCUMENTINFO where CASEID = ?");
			ps.setString(1, caseId);
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
