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
    Sheet =''
    Sheet2 =''
    num_row = 1
    topic = ''
    def start_requests(self):
        yield scrapy.Request(url=self.url, callback=self.parse)
    def parse(self, res):
        #print('\n\n\n\nRunning........................')
        #print(res)
        url_title = ''
        #titles = res.xpath('//nav[@class="main-nav"]/ul/li')
        titles = res.xpath('//div[@class="mgauto wid1004"]/ul/li')
        for item in range(2, len(titles) - 1):
            print(str(item - 1) +' '+ titles.xpath('a/span/text()')[item].get().strip())
        
        #print('\n\n\n\n************************END************************')
        #articles = res.xpath('//div[@class="col-left-folder-v2"]//article[@class="item-news item-news-common"]')
        topic = int(input('Title : ')) + 2
        self.topic = titles[topic].xpath('a/span/text()').get().strip().title()
        
        self.Sheet = WorkBook.add_worksheet()
        self.Sheet.write("A1", "ID")
        self.Sheet.write("B1", "Title")
        self.Sheet.write("C1", "Description")
        self.Sheet.write("D1", "Content")       
        self.Sheet.write("E1", "Name-Img")
        self.Sheet.write("F1", "Publish Date")
        self.Sheet.write("G1", "Images-Link")
        self.Sheet.write("H1", "Tag")
        self.Sheet.write("I1", "Author")
       # self.Sheet.write("J1", "Author")

        self.Sheet2 = WorkBook.add_worksheet()
        self.Sheet2.write("A1", "ID")
        self.Sheet2.write("B1", "Content-Img")


        url_title = self.url + ('/') + titles[topic].xpath('a/@href').get().replace('/', '')
        yield scrapy.Request(url=url_title, callback=self.parse_title)
        
        #print('\n\n\n\n************************END************************')
    
    
    
    def parse_title(self, res):
       
        
        #print('\n\n\n\nRunning Parse_title........................')
        #print(res)
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
        pub_date = res.xpath('//span[@class = "fr fon7 mr2 tt-capitalize"]/text()').get()
       
       #Get values in index = 2. Not get row 1
        description = res.xpath('//h2[@class="fon33 mt1 sapo"]/text()[2]').get() 
        if len(description) < 35:
            description = res.xpath('//h2[@class="fon33 mt1 sapo"]//text()[1]').get()

        img_link = res.xpath('//img/@data-original').getall() 


        content_img_ = res.xpath('//figcaption//text()').getall()
        content_img = ''
        #Format 
        content_img_[content_img_ != '\n']
        
        content = ''
        content_ = res.xpath('//div[@id="divNewsContent"]//text()').getall()

        author = ''
        author_ = res.xpath('//p[@style="text-align:right"]//text()').getall()
        if len(author_) is None:
            author_ = res.xpath('//span[@data-role="source"]//text()').getall()

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
                        
            else:
                # if (var_before == "flag"  and len(content_[item1 + 1]) < 35  and len(content_[item1 + 2]) < 35):
                #     content = content + ('\n+++\n') 
                #     var_before = ''
                #else:
                content = content + content_[item1].strip() + ('\n')
                    #var_after = content_[item1]
                   
            if content_[item1 + 2].strip() == 'Tag :':
                    break    
                #count_temp = 0 



            
        for item2 in tag_:
            tag = tag + item2.strip() + ('; ')
        
        for item3 in content_img_:
            #Write to file excel new
            if len(item3) < 35:
                continue
            else:
                content_img = content_img + item3.strip() + ('\n')

        for item4 in img_link:
            img = img + item4.strip() + ('\n')

        for item5 in author_:
            author = author + item5.strip() + (' ')  
        
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
        #return        
        
       
        self.Sheet.write(self.num_row, 0, self.num_row)
        self.Sheet.write(self.num_row, 1, title)
        self.Sheet.write(self.num_row, 2, description)
        self.Sheet.write(self.num_row, 3, content)
        self.Sheet.write(self.num_row, 4, img_name)
        self.Sheet.write(self.num_row, 5, pub_date)
        self.Sheet.write(self.num_row, 6, img)
        self.Sheet.write(self.num_row, 7, tag)
        self.Sheet.write(self.num_row, 8, author)
        #self.Sheet.write(self.num_row, 9, author)

        self.Sheet2.write(self.num_row, 0, self.num_row)
        self.Sheet2.write(self.num_row, 1, content_img)

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
