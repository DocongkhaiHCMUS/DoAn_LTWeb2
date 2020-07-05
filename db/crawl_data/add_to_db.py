import MySQLdb
import xlrd
db = MySQLdb.connect (host="localhost", user = "root", passwd = "", db = "stdio_python",charset="utf8", use_unicode=True)
 
cursor = db.cursor()
 
cursor.execute("SELECT VERSION()")
 
data = cursor.fetchone()
 
print("Database version : %s ",data)

#import
book = xlrd.open_workbook("ImportExcel.xlsx")
sheet = book.sheet_by_name("NameSheet")
for r in range(0, sheet.nrows):    
    sql = 'INSERT INTO stdio_inspirations(i_id,m_Content,m_Quotes,m_URL,m_Name)VALUES (NULL,"%s", "%s", "%s","%s")' % \
        (sheet.cell(r,0).value,sheet.cell(r,1).value,sheet.cell(r,2).value,sheet.cell(r,3).value)
    try:
        cursor.execute(sql)
        db.commit()
    except:   
        db.rollback()
 
 
db.close()