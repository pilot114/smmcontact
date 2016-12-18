<?php

namespace MainBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class SqlToMongoCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('sqlToMongo')
            ->setDescription('Convert sql dump to Mongo collection')
            ->addArgument('file', InputArgument::REQUIRED, 'file with dump')
            ->addArgument('col', InputArgument::REQUIRED, 'collection')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fileName = $input->getArgument('file');
        $col = $input->getArgument('col');

        // parsing
        $docs = [];
        $file = file($fileName);
        foreach ($file as $line) {
            $line = trim($line);

            if (!empty($line) && $line[0] == '(') {
                $doc = [];
                $record = explode(',', trim($line, "(),;"));
                $doc['city_id']    = trim($record[0]);
                $doc['country_id'] = trim($record[1]);
                $doc['region_id']  = trim($record[2]);
                $doc['name']       = trim($record[3], " '");
                if (isset($record[4])) {
                    $doc['cid'] = trim($record[4]);
                }
                $docs[] = $doc;
            }
        }

        // insert
        $mongo = $this->getContainer()->get('mongo');
        $res = $mongo->insertMany($col, $docs);
        if ($res->isAcknowledged()) {
            $output->writeln('Success. Inserted: ' . $res->getInsertedCount());
        } else {
            $output->writeln('Error');
        }

    }

}
