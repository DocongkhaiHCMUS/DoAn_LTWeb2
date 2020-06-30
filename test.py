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


#WorkBook = xlsxwriter.Workbook('database.xlsx')

class DanTri(scrapy.Spider):
    name = 'dantri'
    url = 'https://dantri.com.vn'
    Post = ''
    Img_post = ''
    Tag = ''
    Tag_post = ''
    num_row = 1
    num_row_1 = 1
    num_row_2 = 1
    num_row_3 = 1
    topic = ''
    avatar = ''
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
        #Get folders in newspaper website
        self.topic = titles[topic].xpath('a/span/text()').get().strip().title()
        
        #Create col in Excel (sheet 1) ____ POST: Tittle, Description, Content
        self.Post = WorkBook.add_worksheet()
        self.Post.write("A1", "ID")
        self.Post.write("B1", "Title")
        self.Post.write("C1", "Description")
        self.Post.write("D1", "Content")   
        self.Post.write("E1", "Name Image_first")
        self.Post.write("F1", "Name Folder_Img")
        self.Post.write("G1", "Source")

        #Create col in sheet 2 ____ Img-post
        self.Img_post = WorkBook.add_worksheet()
        self.Img_post.write("A1", "ID")
        self.Img_post.write("B1", "Img")
        self.Img_post.write("C1", "Content_Img")
        self.Img_post.write("D1", "Folder_Img")

        #____Tag
        self.Tag = WorkBook.add_worksheet()
        self.Tag.write("A1", "ID")
        self.Tag.write("B1", "Name")

        #____Tag-Post
        self.Tag_post = WorkBook.add_worksheet()
        self.Tag_post.write("A1", "ID")
        self.Tag_post.write("B1", "Tag")
        self.Tag_post.write("C1", "Post")

        #Get link website topic to chose
        url_title = self.url + ('/') + titles[topic].xpath('a/@href').get().replace('/', '')
        #Sent data to get for next function
        yield scrapy.Request(url=url_title, callback=self.parse_title)
        
        #print('\n\n\n\n************************END************************')
    
    
    
    def parse_title(self, res):
        #Get link to 
        articles = res.xpath('//div[@class="mt3 clearfix eplcheck" or @class="mt3 clearfix" or @data-offset]')
        
        url_article = []
      #   inn = 1
        for item in articles:
          #  print (self.url)
            url = self.url + item.xpath('a/@href').get()
            if url is not None:
                url_article.append(url)
                # inn = inn + 1
                # if(inn == 5):
                #     break
        for url in url_article:
            yield scrapy.Request(url=url, callback=self.parse_article)
                
        next_page = self.url  + res.xpath('//div[@class="clearfix mt1"]/div/a/@href').get()
        if next_page is not None:
            
            yield scrapy.Request(url=next_page,callback=self.parse_title)

        
        #print('\n\n\n\n************************END************************')
       


    def parse_article(self, res):
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


        content_img_ = res.xpath('//figcaption//text()').getall()
        content_img = ''
        #Format 
        content_img_[content_img_ != '\n']
        
        content = ''
        content_ = res.xpath('//div[@id="divNewsContent"]//text()').getall()

        all_source = res.xpath('//p[@style="text-align:right"]//text()').getall()

        Source = ''
        arr_Source = res.xpath('//p[@style="text-align:right"]/em/text()').getall()
        if arr_Source == '':
            arr_Source = res.xpath('//p[@style="text-align:right"]/strong/text()').getall()
        
        # if len(Source_) is None:
        #     Source_ = res.xpath('//span[@data-role="source"]//text()').getall()

        # end_content = res.xpath('//p[@style="text-align:right"]/text()').getall()
        #Format array content_img_, remove '\n' row...
        for item3 in range(len(content_img_)) :
            try:
                content_img_.remove('\n')
            except:
                break
        content_img_.append(" ")            

        #Edit link tags
        tag = ''
        tag_ = res.xpath('//span[@class="news-tags-item"]/a/text()').getall()

        img = ''

       
        


#ghep mang content thanh mot dong
        #count_temp = 0
        item_c_img = 0

        for item1 in range(len(content_)):
            
            #Change img_content to '+++', add to string content
            if content_[item1] == content_img_[item_c_img]:
                # count_temp = count_temp + 1
                # if (count_temp == 3):
                content = content + ('\n+++\n')
                    #var_before = "flag"o
                    
                item_c_img = item_c_img + 1
            
            elif content_[item1] in all_source:
                continue
            elif content_[item1] in arr_Source:
                continue
                        
            else:
                # if (var_before == "flag"  and len(content_[item1 + 1]) < 35  and len(content_[item1 + 2]) < 35):
                #     content = content + ('\n+++\n') 
                #     var_before = ''
                #else:
                content = content + content_[item1].strip()
                    #var_after = content_[item1]
                   
            if content_[item1 + 2].strip() == 'Tag :':
                    break    
                #count_temp = 0 



            
        for item2 in tag_:
            tag = tag + item2.strip() + ('; ')
        
        for item3 in content_img_:
            #Write to file excel new
            if len(item3) < 8:
                continue
            else:
                content_img = content_img + item3.strip() + ('\n')

        for item4 in img_link:
            img = img + item4.strip() + ('\n')

        # for item5 in arr_Source:
        #     Source = Source + item5.strip() + (' ')  
            Source = arr_Source[-1]
        
        dir_path = "Images/{}/{}".format(self.topic, self.num_row)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
        
        img_name = ''
        numberI = 1
        if img is not None:
            for i in img_link:
                img_data = requests.get(i).content
                img_name = '{}_img_{}'.format(self.topic.replace(' ','').lower(), numberI) if img is not None  else "no_image"
                with open('Images/{}/{}/{}.jpg'.format(self.topic, self.num_row , img_name), 'wb') as handler:
                    handler.write(img_data)   
                numberI = numberI + 1

        #Set name for first img    
        self.avatar = '{}_img_{}'.format(self.topic.replace(' ','').lower(), 1) if img is not None  else "no_image" 
        
    #Write to excel file    
       
        # index_post = 0
        # for item_1 in range(self.num_row_1, self.num_row_1 + len(content_img_)):
        #     self.Img_post.write(self.num_row_1, 0, self.num_row_1)
        #     self.Img_post.write(self.num_row_1, 1, tag_[index_post])
        #     self.Img_post.write(self.num_row_1, 2, )
        #     self.Img_post.write(self.num_row_1, 3, )
        #     index_post = index_post + 1
        #     self.num_row = self.num_row + 1
        self.Post.write(self.num_row, 0, self.num_row)
        self.Post.write(self.num_row, 1, title)
        self.Post.write(self.num_row, 2, description)
        self.Post.write(self.num_row, 3, content)
        self.Post.write(self.num_row, 4, self.avatar)
        self.Post.write(self.num_row, 5, "{}/{}".format(self.topic.replace(' ','').lower(),self.num_row))
        self.Post.write(self.num_row, 6, Source)

        #Number for content_img
        index_img_post = 0
        img_name_ = ''
        #Number for img_name
        number_img = 1
        for item_1 in range(self.num_row_1, self.num_row_1 + len(img_link)):
            img_name_ = '{}_img_{}'.format(self.topic.replace(' ','').lower(), number_img) if img is not None  else "no_image"
            self.Img_post.write(self.num_row_1, 0, self.num_row_1)
            self.Img_post.write(self.num_row_1, 1, img_name_)
            self.Img_post.write(self.num_row_1, 2, content_img_[index_img_post])
            self.Img_post.write(self.num_row_1, 3, "{}/{}".format(self.topic.replace(' ','').lower(),self.num_row))
            
            index_img_post = index_img_post + 1
            self.num_row_1 = self.num_row_1 + 1
            number_img = number_img + 1

        # self.Img_post.write(self.num_row, 0, self.num_row)
        # self.Img_post.write(self.num_row, 1, content_img)
        # self.Img_post.write(self.num_row, 2, content_img)
        # self.Img_post.write(self.num_row, 3, content_img)


        index_tag = 0
        for item_2 in range(self.num_row_2, self.num_row_2 + len(tag_)):
            self.Tag.write(self.num_row_2, 0, self.num_row_2)
            self.Tag.write(self.num_row_2, 1, tag_[index_tag])
            index_tag = index_tag + 1
            self.num_row_2 = self.num_row_2 + 1
        # self.Tag.write(self.num_row, 0, self.num_row)
        # self.Tag.write(self.num_row, 1, tag_)

        index_tag_post = 0
        for item_3 in range(self.num_row_3, self.num_row_3 + len(tag_)):
            self.Tag_post.write(self.num_row_3, 0, self.num_row_3)
            self.Tag_post.write(self.num_row_3, 1, tag_[index_tag_post])
            self.Tag_post.write(self.num_row_3, 2, self.num_row)
            index_tag_post = index_tag_post + 1
            self.num_row_3 = self.num_row_3 + 1
        # self.Tag_post.write(self.num_row, 0, self.num_row)
        # self.Tag_post.write(self.num_row, 1, content_img)
        # self.Tag_post.write(self.num_row, 2, content_img)

        print("Write Article {} : -> DONE".format(self.num_row),end='\n\n')
        self.num_row += 1
        
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

WorkBook = xlsxwriter.Workbook(input('Name Database: ') + '.xlsx')

if __name__ == "__main__":
    # process = CrawlerProcess()
    # process.crawl(VnExpress)
    # process.start()
    Run()
    WorkBook.close()