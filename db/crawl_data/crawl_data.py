# -*- coding: utf-8 -*-
"""
Created on Tue Jun 30 11:52:18 2020

@author: Dell Latitude E5470
"""


import scrapy
import json
import os
import re
import time
import sys
import requests
from scrapy.crawler import CrawlerProcess, CrawlerRunner
from scrapy.utils.project import get_project_settings
from scrapy.utils.log import configure_logging
from urllib import parse as UrlParser
from multiprocessing import Process, Queue
from twisted.internet import reactor
import xlsxwriter




## This function gets name of category to assign folder_name
def get_category(x):
    switcher={
        3:'XaHoi',
        4:'TheGioi',
        5:'TheThao',
        6:'GiaoDuc',
        7:'NhanAi',
        8:'KinhDoanh',
        9:'BatDongSan',
        10:'VanHoa',
        11:'GiaiTri',
        12:'DuLich',
        13:'PhapLuat',
        14:'NhipSongTre',
        15:'SucKhoe',
        16:'SucManhSo',
        17:'Xe',
        18:'TinhYeu'
        }
    return switcher.get(x)

class DanTri(scrapy.Spider):
    name = 'dantri'
    url = 'https://dantri.com.vn'
    Post = ''
    Img_post = ''
    Tag = ''
    Tag_post = ''
    Subfolder = ''
    Comments = ''
    num_row = 1
    num_row_1 = 1
    num_row_2 = 1
    num_row_3 = 1
    num_row_4 = 1
    num_row_5 = 1
    num_subfolder = 0
    id_topic = 0
    topic = ''
    
    
    name_BD =''
    WorkBook =''
    
    len_subfolder = 0
    name_subfolder = ''
    count_img_no_content = 0
    folder_name='' ## name of category
    Second_level_Category = ''
    avatar = ''
    
    def create_workBook(self):
        self.WorkBook = xlsxwriter.Workbook(self.name_BD + '.xlsx')     
        #Create col in Excel (sheet 1) ____ POST: Tittle, Description, Content
        self.Post = self.WorkBook.add_worksheet()
        self.Post.write("A1", "ID")
        self.Post.write("B1", "Title")
        self.Post.write("C1", "Description")
        self.Post.write("D1", "Content")
        self.Post.write("E1", "Second_level_Category") ## attribute to save secondary level category
        self.Post.write("F1", "Name Image_first")
        self.Post.write("G1", "Name Folder_Img")
        self.Post.write("H1", "Source")
        self.Post.write("I1", "Public_date")

        #Create col in sheet 2 ____ Img-post
        self.Img_post = self.WorkBook.add_worksheet()
        self.Img_post.write("A1", "ID")
        self.Img_post.write("B1", "Img")
        self.Img_post.write("C1", "Content_Img")
        self.Img_post.write("D1", "Folder_Img")

        #____Tag
        self.Tag = self.WorkBook.add_worksheet()
        self.Tag.write("A1", "ID")
        self.Tag.write("B1", "Name")

        #____Tag-Post
        self.Tag_post = self.WorkBook.add_worksheet()
        self.Tag_post.write("A1", "ID")
        self.Tag_post.write("B1", "Tag")
        self.Tag_post.write("C1", "Post")

        #____Subfolders
        self.Subfolder = self.WorkBook.add_worksheet()
        self.Subfolder.write("A1", "ID")
        self.Subfolder.write("B1", "ID Topic")
        self.Subfolder.write("C1", "Name Topic")
        self.Subfolder.write("D1", "Name Subfolder")

        #____Comments
        self.Comments = self.WorkBook.add_worksheet()
        self.Comments.write("A1", "ID")
        self.Comments.write("B1", "ID topic")
        self.Comments.write("C1", "Comment time")
        self.Comments.write("D1", "Comment")

    def parse_name_subfolder(self):
        #Remove dau cau
        name_sub = self.name_subfolder
        name_sub = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', name_sub)
        name_sub = re.sub(r'[ÀÁẠẢÃĂẰẮẶẲẴÂẦẤẬẨẪ]', 'A', name_sub)
        name_sub = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', name_sub)
        name_sub = re.sub(r'[ÈÉẸẺẼÊỀẾỆỂỄ]', 'E', name_sub)
        name_sub = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', name_sub)
        name_sub = re.sub(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]', 'O', name_sub)
        name_sub = re.sub(r'[ìíịỉĩ]', 'i', name_sub)
        name_sub = re.sub(r'[ÌÍỊỈĨ]', 'I', name_sub)
        name_sub = re.sub(r'[ùúụủũưừứựửữ]', 'u', name_sub)
        name_sub = re.sub(r'[ƯỪỨỰỬỮÙÚỤỦŨ]', 'U', name_sub)
        name_sub = re.sub(r'[ỳýỵỷỹ]', 'y', name_sub)
        name_sub = re.sub(r'[ỲÝỴỶỸ]', 'Y', name_sub)
        name_sub = re.sub(r'[Đ]', 'D', name_sub)
        name_sub = re.sub(r'[đ]', 'd', name_sub)
        name_sub = name_sub.title()
        name_sub = name_sub.replace(' ', '')
        return name_sub
    
    
    def start_requests(self):
        yield scrapy.Request(url=self.url, callback=self.parse)
      
    def parse(self, res):

        url_title = ''
        #titles = res.xpath('//nav[@class="main-nav"]/ul/li')
        titles = res.xpath('//div[@class="mgauto wid1004"]/ul/li')
        for item in range(2, len(titles) - 1):
            print(str(item - 1) +' '+ titles.xpath('a/span/text()')[item].get().strip())
        
        #Input topic
        topic = int(input('Title : ')) + 2 
        self.id_topic = topic - 2
        #Get name folder
        self.folder_name = get_category(topic)
        
        ##Get name category1  
        self.name_BD = get_category(topic)

        #Get folders in newspaper website
        self.topic = titles[topic].xpath('a/span/text()').get().strip().title()
    
        #Get link website topic to chose
        url_title = self.url + titles[topic].xpath('a/@href').get()
        #Sent data to get for next function
        yield scrapy.Request(url=url_title, callback=self.parse_subfolder)
        
        #print('\n\n\n\n************************END************************')

    def parse_subfolder(self, res):

        #Get subfolder       
        if self.name_BD=='PhapLuat':
            self.name_subfolder = self.name_BD
            self.create_workBook()
            yield scrapy.Request(url=res.url, callback=self.parse_title)
        else:
        #Duyet cac item
            print ('\n\tSubfolder \n')
            subfolder = res.xpath('//ul[@id="ul_submenu"]/li')

            for item in range(0, len(subfolder)):
                try:
                    temp = subfolder[item].xpath('a/text()').get().strip() 
                except:
                    temp = subfolder[item].xpath('h1/a/text()').get().strip()
                print(str(item + 1) + ' ' + temp)
            #Input subfolder to chose   
            sub = int(input('Subfolder: '))  - 1
            
            #Get len subfolders
            self.len_subfolder = len(subfolder)
            
            #Get name subfolder to export excel
            self.name_subfolder = subfolder[sub].xpath('a/text()').get().strip()
            
            ##Get name category 2 and create excel
            self.name_BD = self.name_BD + '_' + self.parse_name_subfolder()
            self.create_workBook()

            url_subfolder = self.url + subfolder[sub].xpath('a/@href').get()
            if url_subfolder is None:
                url_subfolder = self.url + subfolder[sub].xpath('h1/a/@href').get()
            # self.num_subfolder += 1
            
            yield scrapy.Request(url=url_subfolder, callback=self.parse_title)

            #print('\n\n\n\n************************END************************')

    def parse_title(self, res):
        #Get link to 
        articles = res.xpath('//div[@class="mt3 clearfix eplcheck" or @class="mt3 clearfix" or @data-offset]')
        
        url_article = []

        for item in articles:
            url = self.url + item.xpath('a/@href').get()
            if url is not None:
                url_article.append(url)
        for url in url_article:
            yield scrapy.Request(url=url, callback=self.parse_article)
                
        next_page = self.url  + res.xpath('//div[@class="clearfix mt1"]/div/a/@href').get()
        if next_page is not None:
            yield scrapy.Request(url=next_page,callback=self.parse_title)

        
        #print('\n\n\n\n************************END************************')
       


    def parse_article(self, res):

        #print(res.url)
        #print('\n\n\n\nRunning Parse_Article........................')
        #print(res)

        title = res.xpath('//h1[@class="fon31 mgb15"]/text()').get()
        title = title.strip()
        
        pub_date = res.xpath('//span[@class = "fr fon7 mr2 tt-capitalize"]/text()').get()
        pub_date = pub_date.strip()
       
       #Get values in index = 2. Not get row 1
        description = res.xpath('//h2[@class="fon33 mt1 sapo"]/text()[2]').get()
        if len(description) < 35:
            description = res.xpath('//h2[@class="fon33 mt1 sapo"]//text()[1]').get()
        description = description.strip()

        img_link = res.xpath('//div[@id="divNewsContent"]//img/@data-original').getall() 

#Get - 223, va cho vao mang moi
        #content_img_ = res.xpath('//div[@id="divNewsContent"]//figcaption//text()').getall()
        content_img_ = []
        #Get all img element
        content_img_temp = res.xpath('//div[@id="divNewsContent"]//figure')

        for item in content_img_temp:
            #Get text img
            text_temp = item.xpath('figcaption//text()').get()
                #If text is none => text = "ING_No_Content"
            if text_temp == '\n':
                text_temp = item.xpath('figcaption/p/text()').get()
            if text_temp is None:
                text_temp = "IMG_NO_CONTENT"
                self.count_img_no_content += 1

            content_img_.append(text_temp)

        content_video = res.xpath('//figure[@class="video"]/figcaption/text()').getall()
 
        content_img = ''
        
        content = ''
        content_ = res.xpath('//div[@id="divNewsContent"]//text()').getall()
        
        ###Get all headings in content
        headings = res.xpath('//div[@id="divNewsContent"]/p/strong//text()').getall()
        
        ###Get all em, u and strong,sup
        em_word = res.xpath('//div[@id="divNewsContent"]/p/em//text()').getall()
        bold_word = headings
        underScore_word = res.xpath('//div[@id="divNewsContent"]/p/u//text()').getall()
        sup_word = res.xpath('//div[@id="divNewsContent"]/p/sup//text()').getall()
        
        # Get all source insert into list
        all_source = res.xpath('//div[@id="divNewsContent"]//p[@style="text-align:right"]//text()').getall()

        # Get source in the last line
        Source = ''
        arr_Source = res.xpath('//div[@id="divNewsContent"]//p[@style="text-align:right"]/em/text()').getall()
        if arr_Source == []:
            arr_Source = res.xpath('//div[@id="divNewsContent"]//p[@style="text-align:right"]/strong/text()').getall()
        
        # Get comments
        comments = res.xpath('//div[@class="cmt-content"]//text()').getall()

        # Get time user commented
        time_cmt = res.xpath('//span[@class="date"]//text()').getall()

     # Remove content_video from content_img_
        #item_c_video = 0
        for item1 in range(len(content_img_)):
            #Change img_content to ' ', add to string content
            try:
                content_img_.remove(content_video[item1])         
            except:
                break
                    

      #  content_video_ = res.xpath('//div[@id="divNewsContent"]//figcaption/text()').getall()
        #Format content imgs
        for item3 in range(len(content_img_)) :
            try:
                content_img_.remove('\n')
            except:
                break
        content_img_.append("  ")            

        #Edit link tags
        tag = ''
        tag_ = res.xpath('//div[@id="divNewsContent"]//span[@class="news-tags-item"]/a/text()').getall()

        img = ''

        #ghep mang content thanh mot dong
        #count_temp = 0
        item_c_img = 0
        item_c_video = 0
        check_mark = False
        count_item_c = 0
        #Mark img first
        if content_img_[0] == "IMG_NO_CONTENT" and len(content_[1]) < 10:
            content = content + ('xxx\n')
            item_c_img = item_c_img + 1
            count_item_c += 1

        for item1 in range(len(content_)):

             # Remove content_video from content_img_
            #for item1 in range(len(content_video)):
            if content_[item1] in content_video:
                content_.pop(item1)             
                
            #Change img_content to '+++', add to string content               
            if content_img_[item_c_img] == "IMG_NO_CONTENT" and len(content_[item1]) < 5 and len(content_[item1 + 1]) < 5 and  len(content_[item1 + 2]) > 10: # and content_[item1 + 2] != ('+++\n'):
                if check_mark == True:
                    content = content + ('xxx\n')
                    item_c_img = item_c_img + 1    
                    count_item_c += 1
            elif content_[item1] == content_img_[item_c_img]:
                content = content + ('+++\n')
                check_mark = False
                item_c_img = item_c_img + 1

            # remove source from content
            elif all_source != [] and content_[item1] in all_source:
                continue
            elif arr_Source != [] and content_[item1] in arr_Source:
                continue
                        
            else:
                ### sign heading, em , bold and under-score
                if headings != [] and content_[item1] in headings and '\n' in content_[item1]:
                    content = content + '<heading** ' + content_[item1].strip() + '**heading>\n'
                elif bold_word != [] and content_[item1] in bold_word and '\n' not in content_[item1]:
                    content = content.rstrip() + '  <strong** ' + content_[item1].strip() + ' **strong>  '
                elif em_word != [] and content_[item1] in em_word and '\n' not in content_[item1]:
                    content = content.rstrip() + '  <em** ' + content_[item1].strip() + ' **em>  '
                elif underScore_word != [] and content_[item1] in underScore_word and '\n' not in content_[item1]:
                    content = content.rstrip() + '  <under** ' + content_[item1].strip() + ' **under>  '
                elif sup_word != [] and content_[item1] in sup_word and '\n' not in content_[item1]:
                    content = content.rstrip() + '  <sup** ' + content_[item1].strip() + ' **sup>  '
                
                else:
                    content = content + content_[item1].strip() +'\n'
                    check_mark = True

            if content_[item1 + 2].strip() == 'Tag :':
                    break    
        
        if self.count_img_no_content > count_item_c:
            for item9 in range(self.count_img_no_content - count_item_c):
                content = content + ('\nxxx\n')
        #Remove last row content-img (row '')

        content_img_.remove('  ')
        self.count_img_no_content = 0
        
        for item2 in tag_:
            tag = tag + item2.strip() + ('; ')
        
        # write img_content
        for item3 in content_img_:
            #Write to file excel new
            if len(item3) < 8:
                continue
            else:
                content_img = content_img + item3.strip() + ('\n')

        # for item4 in img_link:
        #     img = img + item4.strip() + ('\n')

        # assign source is the last item in arr_Source            
        Source = arr_Source[-1]
        
        #Remove dau cau       
        name_sub = self.parse_name_subfolder()


        name_folder_img = self.name_BD
        dir_path = "Images/{}/{}".format(str(name_folder_img), self.num_row)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
        
        img_name = ''
        numberI = 1
        if img is not None:
            for i in img_link:
                img_data = requests.get(i).content
                img_name = '{}_img_{}'.format(self.folder_name, numberI) if img is not None  else "no_image"
                with open('Images/{}/{}/{}.jpg'.format(name_folder_img, self.num_row , img_name), 'wb') as handler:
                    handler.write(img_data)   
                numberI = numberI + 1

        #Set name for first img    
        self.avatar = '{}_img_{}'.format(self.folder_name, 1) if img is not None  else "no_image" 
        
    #Write to excel file    
        self.Post.write(self.num_row, 0, self.num_row)
        self.Post.write(self.num_row, 1, title)
        self.Post.write(self.num_row, 2, description)
        self.Post.write(self.num_row, 3, content)
        self.Post.write(self.num_row, 4, self.name_subfolder) ## attribute to save secondary level category
        self.Post.write(self.num_row, 5, self.avatar)
        self.Post.write(self.num_row, 6, "{}/{}".format(self.name_BD,self.num_row))
        self.Post.write(self.num_row, 7, Source)
        self.Post.write(self.num_row, 8, pub_date)


#Print content-img
        #Number for content_img
        index_img_post = 0
        img_name_ = ''
        #Number for img_name
        number_img = 1
        for item_1 in range(self.num_row_1, self.num_row_1 + len(content_img_)):    
            img_name_ = '{}_img_{}'.format(self.folder_name, number_img) if img is not None  else "no_image"
            self.Img_post.write(self.num_row_1, 0, self.num_row_1)
            self.Img_post.write(self.num_row_1, 1, img_name_)
            self.Img_post.write(self.num_row_1, 2, content_img_[index_img_post])
            self.Img_post.write(self.num_row_1, 3, "{}/{}".format(self.name_BD,self.num_row))
            
            index_img_post = index_img_post + 1
            self.num_row_1 = self.num_row_1 + 1
            number_img = number_img + 1


        index_tag = 0
        for item_2 in range(self.num_row_2, self.num_row_2 + len(tag_)):
            self.Tag.write(self.num_row_2, 0, self.num_row_2)
            self.Tag.write(self.num_row_2, 1, tag_[index_tag])
            index_tag = index_tag + 1
            self.num_row_2 = self.num_row_2 + 1

        index_tag_post = 0
        for item_3 in range(self.num_row_3, self.num_row_3 + len(tag_)):
            self.Tag_post.write(self.num_row_3, 0, self.num_row_3)
            self.Tag_post.write(self.num_row_3, 1, tag_[index_tag_post])
            self.Tag_post.write(self.num_row_3, 2, self.num_row)
            index_tag_post = index_tag_post + 1
            self.num_row_3 = self.num_row_3 + 1
        

        self.Subfolder.write(self.num_row_4, 0, self.num_row_4)
        self.Subfolder.write(self.num_row_4, 1, self.id_topic)
        self.Subfolder.write(self.num_row_4, 2, self.topic)
        self.Subfolder.write(self.num_row_4, 3, self.name_subfolder)
        self.num_row_4 = self.num_row_4 + 1

#Export comment
        index_comments = 0
        for item_5 in range(self.num_row_5, self.num_row_5 + len(comments)):
            self.Comments.write(self.num_row_5, 0, self.num_row_5)
            self.Comments.write(self.num_row_5, 1, self.num_row)
            self.Comments.write(self.num_row_5, 2, time_cmt[index_comments])
            self.Comments.write(self.num_row_5, 3, comments[index_comments])
            index_comments = index_comments + 1
            self.num_row_5 = self.num_row_5 + 1

        print("Write Article {} : -> DONE".format(self.num_row),end='\n\n')
        self.num_row += 1
        
        # if self.num_row % 3 == 0:
        #     #Tang subfolder + 1
        #     self.num_subfolder += 1
        #     yield scrapy.Request(callback=self.start_requests)

        if self.name_BD == 'PhapLuat':
            if self.num_row > 50:
                self.WorkBook.close()
                os._exit(0)
        else:
            if self.num_row > 20:
                self.WorkBook.close()
                os._exit(0)

        #print('\n\n\n\n************************END************************')


def sleep(_, duration=5):
    print(f'sleeping for: {duration}')
    time.sleep(duration)  # block here


def crawl(runner):
    d = runner.crawl(DanTri)
    d.addBoth(sleep)
    d.addBoth(lambda _: crawl(runner))
    return d

def Run():
    runner = CrawlerRunner(get_project_settings())
    crawl(runner)
    reactor.run()

if __name__ == "__main__":
    # process = CrawlerProcess()
    # process.crawl(VnExpress)
    # process.start()
    while True:
        Run()
        k = int(input('Ban muon tiep tuc ? (0: Khong, 1 : co)'))
        if( k== 0):
            break